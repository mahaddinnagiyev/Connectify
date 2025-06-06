import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as dotenv from 'dotenv';
import { MessageType } from '../../enums/message-type.enum';
import { MessengerService } from '../messenger.service';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '../../supabase/supabase.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '../../jwt/jwt-payload';
import { IUser } from '../../interfaces/user.interface';
import { MessageStatus } from '../../enums/message-status.enum';
import { WebpushService } from '../../webpush/webpush.service';
import { LoggerService } from '../../logger/logger.service';
import { IAccount } from '../../interfaces/account.interface';

dotenv.config();

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    allowedHeaders: ['Authorization'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly messengerService: MessengerService,
    private readonly jwtService: JwtService,
    private readonly supabase: SupabaseService,
    private readonly logger: LoggerService,
    private readonly webPushService: WebpushService,
  ) {}

  private extractToken(client: Socket): string | null {
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers.authorization?.split(' ')[1] ||
      null;

    return token;
  }

  private async validateUser(userId: string): Promise<IUser> {
    try {
      const { data: user, error } = await this.supabase
        .getClient()
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !user) {
        this.logger.warn(
          `User validation failed: ${error?.message}`,
          'messenger-gateway',
          `User ID: ${userId}`,
        );
        throw new UnauthorizedException('User not found');
      }
      return user;
    } catch (error) {
      this.logger.error(
        error.message,
        'messenger-gateway',
        'There was an error in validateUser',
        error.stack,
      );
      throw new UnauthorizedException('User validation failed');
    }
  }

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        throw new UnauthorizedException('Missing token');
      }
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_ACCESS_SECRET_KEY,
      });
      const user = await this.validateUser(payload.id);

      const { data: account } = await this.supabase
        .getClient()
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .single();

      await this.supabase
        .getClient()
        .from('accounts')
        .update({ last_login: new Date() })
        .eq('user_id', user.id);

      const { password, is_admin, ...userWithoutSensitive } = user;

      const safeUser = {
        ...userWithoutSensitive,
        profile_picture: account?.profile_picture,
      };

      client.data.user = safeUser;
      client.join(`user:${user.id}`);
      this.logger.info(
        `Client connected: ${client.id} (User: ${user.id})`,
        'messenger-gateway',
      );
    } catch (error) {
      this.logger.error(
        error.message,
        'messenger-gateway',
        'There was an error in handleConnection',
        error.stack,
      );
      client.emit('error', {
        success: false,
        status: error.response?.statusCode || 500,
        error: error.message,
      });
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        throw new UnauthorizedException('Missing token');
      }
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_ACCESS_SECRET_KEY,
      });
      const user = await this.validateUser(payload.id);

      await this.supabase
        .getClient()
        .from('accounts')
        .update({ last_login: new Date() })
        .eq('user_id', user.id);
      this.logger.info(`User disconnected: ${client.id}`, 'messenger-gateway');
    } catch (error) {
      this.logger.error(
        error.message,
        'messenger-gateway',
        'There was an error in handleDisconnect',
        error.stack,
      );
      client.emit('error', {
        success: false,
        status: error.response?.statusCode || 500,
        error: error.message,
      });
      client.disconnect();
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, payload: { user2Id: string }) {
    try {
      if (!payload || !payload.user2Id) {
        throw new BadRequestException('Missing user2Id in payload');
      }
      this.logger.debug(
        `Join room request from ${client.data.user.id} with ${payload.user2Id}`,
        'messenger-gateway',
      );

      const room = await this.messengerService.createChatRoomIfNotExist(
        client.data.user.id,
        payload.user2Id,
      );

      if (!room || room.error) {
        throw new BadRequestException(
          room?.error || 'Failed to create or retrieve chat room',
        );
      }

      const personalRoom = `user:${client.data.user.id}`;
      const rooms = Array.from(client.rooms).filter(
        (r) => r !== client.id && r !== personalRoom,
      );
      for (const oldRoom of rooms) {
        client.leave(oldRoom);
        this.logger.info(
          `User ${client.id} left room ${oldRoom}`,
          'messenger-gateway',
        );
      }

      client.join(room.id);

      client.emit('joinRoomSuccess', { roomId: room.id });
      this.server.to(`user:${client.data.user.id}`).emit('chatRoomsUpdated');
      this.server.to(`user:${payload.user2Id}`).emit('chatRoumsUpdated');
      this.logger.info(
        `User ${client.id} joined room ${room.id}`,
        'messenger-gateway',
      );
    } catch (error) {
      this.logger.error(
        error.message,
        'messenger-gateway',
        'There was an error in joinRoom',
        error.stack,
      );
      if (error instanceof BadRequestException) {
        client.emit('error', {
          success: false,
          message: 'User1 and User2 cannot be the same.',
        });
      } else {
        client.emit('error', {
          success: false,
          message: error.message || 'Unexpected error occurred',
        });
      }
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    client: Socket,
    payload: {
      roomId: string;
      content: string;
      message_type: MessageType;
      parent_message_id?: string;
      message_name?: string;
      message_size?: number;
    },
  ) {
    try {
      if (
        !payload ||
        !payload.roomId ||
        !payload.content ||
        !payload.message_type
      ) {
        throw new BadRequestException('Missing required message fields');
      }

      if (client.data.user.is_banned) {
        throw new UnauthorizedException(
          'You are banned from sending messages.',
        );
      }

      this.logger.debug(
        `Send message request from ${client.data.user.id} in room ${payload.roomId}`,
        'messenger-gateway',
      );

      const savedMessage = await this.messengerService.sendMessage(
        payload.roomId,
        client.data.user.id,
        payload.content,
        payload.message_type,
        payload.parent_message_id,
        payload.message_name,
        payload.message_size,
      );
      const messageToEmit = { ...savedMessage, roomId: savedMessage.room_id };

      this.server.to(payload.roomId).emit('newMessage', messageToEmit);

      const room = await this.messengerService.getChatRoomById(payload.roomId);
      const recipientId = room.user_ids.find(
        (id: string) => id !== client.data.user.id,
      );

      if (recipientId) {
        const socketsInRoom = await this.server
          .in(payload.roomId)
          .fetchSockets();
        const recipientSocket = socketsInRoom.find(
          (socket) => socket.data.user.id === recipientId,
        );

        if (recipientSocket) {
          await this.messengerService.setMessageRead(
            payload.roomId,
            recipientId,
          );
          this.server.to(`user:${recipientId}`).emit('unreadCountUpdated', {
            roomId: payload.roomId,
            count: 0,
          });
          return this.server.to(payload.roomId).emit('messagesRead', {
            roomId: payload.roomId,
          });
        }

        let notificationBody = payload.content;
        if (payload.message_type === MessageType.IMAGE) {
          notificationBody = '🖼 Image';
        } else if (payload.message_type === MessageType.VIDEO) {
          notificationBody = '🎬 Video';
        } else if (payload.message_type === MessageType.FILE) {
          notificationBody = '📎 File';
        } else if (payload.message_type === MessageType.AUDIO) {
          notificationBody = '🎵 Audio';
        }

        await this.webPushService.sendPushNotification(recipientId, {
          title: `${client.data.user.username} sent you a message`,
          body: notificationBody,
          data: { roomId: payload.roomId },
        });

        const { count } = await this.supabase
          .getClient()
          .from('messages')
          .select('*', { count: 'exact' })
          .eq('room_id', payload.roomId)
          .neq('sender_id', recipientId)
          .neq('status', MessageStatus.READ);
        this.server.to(`user:${recipientId}`).emit('unreadCountUpdated', {
          roomId: payload.roomId,
          count: count || 0,
        });
        this.server.to(`user:${client.data.user.id}`).emit('chatRoomsUpdated');
        if (recipientId) {
          this.server.to(`user:${recipientId}`).emit('chatRoomsUpdated');
        }
      }

      this.logger.debug(
        `Message sent in room ${payload.roomId}: ${JSON.stringify(savedMessage)}`,
        'messenger-gateway',
      );
    } catch (error) {
      this.logger.error(
        error.message,
        'messenger-gateway',
        'There was an error in sendMessage',
        error.stack,
      );
      client.emit('error', {
        success: false,
        message: error.message || 'Error sending message',
      });
    }
  }

  @SubscribeMessage('getChatRooms')
  async handleGetChatRooms(client: Socket) {
    try {
      const userId = client.data.user?.id;
      if (!userId) {
        return new UnauthorizedException('User not authenticated');
      }

      const chatRooms = await this.messengerService.getChatRoomsForUser(userId);
      client.emit('getChatRooms', chatRooms);
      this.logger.debug(
        `Chat rooms sent to user ${userId}`,
        'messenger-gateway',
      );
    } catch (error) {
      this.logger.error(
        error.message,
        'messenger-gateway',
        'There was an error in getChatRooms',
        error.stack,
      );
      client.emit('error', {
        success: false,
        message: error.message || 'Error retrieving chat rooms',
      });
    }
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(
    client: Socket,
    payload: { roomId: string; limit?: number },
  ) {
    try {
      if (!payload || !payload.roomId) {
        throw new BadRequestException('Missing roomId in payload');
      }

      const messages = await this.messengerService.getMessagesForRoom(
        payload.roomId,
        payload.limit || 30,
      );

      client.emit('messages', { roomId: payload.roomId, messages });
      this.logger.debug(
        `Messages sent for room ${payload.roomId}`,
        'messenger-gateway',
      );
    } catch (error) {
      this.logger.error(
        error.message,
        'messenger-gateway',
        'There was an error in getMessages',
        error.stack,
      );
      client.emit('error', {
        success: false,
        message: error.message || 'Error retrieving messages',
      });
    }
  }

  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(client: Socket, payload: { roomId: string }) {
    try {
      const { data: account } = (await this.supabase
        .getClient()
        .from('accounts')
        .select('*')
        .eq('user_id', client.data.user.id)
        .single()) as { data: IAccount };

      await this.supabase
        .getClient()
        .from('accounts')
        .update({ last_login: new Date() })
        .eq('id', account.id);

      client.leave(payload.roomId);
      this.logger.info(
        `Client ${client.id} left room ${payload.roomId}`,
        'messenger-gateway',
      );
      client.emit('roomLeft', payload.roomId);
    } catch (error) {
      this.logger.error(
        error.message,
        'messenger-gateway',
        'There was an error in leaveRoom',
        error.stack,
      );
      client.emit('error', { message: error.message || 'Error leaving room' });
    }
  }

  @SubscribeMessage('setMessageRead')
  async handleSetMessageRead(client: Socket, payload: { roomId: string }) {
    try {
      await this.messengerService.setMessageRead(
        payload.roomId,
        client.data.user.id,
      );

      const { count } = await this.supabase
        .getClient()
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('room_id', payload.roomId)
        .neq('sender_id', client.data.user.id)
        .neq('status', MessageStatus.READ);

      this.server.to(`user:${client.data.user.id}`).emit('unreadCountUpdated', {
        roomId: payload.roomId,
        count: count || 0,
      });

      this.server
        .to(payload.roomId)
        .emit('messagesRead', { roomId: payload.roomId });
    } catch (error) {
      this.logger.error(
        error.message,
        'messenger-gateway',
        'There was an error in setMessageRead',
        error.stack,
      );
      client.emit('error', {
        success: false,
        message: error.message || 'Error setting messages as read',
      });
    }
  }

  @SubscribeMessage('unsendMessage')
  async handleUnsendMessage(
    client: Socket,
    payload: { roomId: string; messageId: string },
  ) {
    try {
      const result = await this.messengerService.unsendMessage(
        payload.roomId,
        payload.messageId,
        client.data.user.id,
      );

      const { data: newLastMessage } = await this.supabase
        .getClient()
        .from('messages')
        .select('*')
        .eq('room_id', payload.roomId)
        .order('created_at', { ascending: false })
        .limit(1);

      const { data: allMessages } = await this.supabase
        .getClient()
        .from('messages')
        .select('*')
        .eq('room_id', payload.roomId)
        .order('created_at', { ascending: true });

      this.server.to(payload.roomId).emit('messageUnsent', {
        messageId: payload.messageId,
        roomId: payload.roomId,
      });
      this.server.to(payload.roomId).emit('lastMessageUpdated', {
        roomId: payload.roomId,
        lastMessage: newLastMessage?.[0] || null,
      });
      this.server.to(payload.roomId).emit('messages', {
        roomId: payload.roomId,
        messages: allMessages || [],
      });
      client.emit('unsendMessageSuccess', result);
    } catch (error) {
      this.logger.error(
        error.message,
        'messenger-gateway',
        'There was an error unsending message',
        error.stack,
      );
      client.emit('error', {
        success: false,
        message: error.message || 'Error unsending message',
      });
    }
  }

  @SubscribeMessage('changeRoomName')
  async changeRoomName(
    client: Socket,
    payload: { roomId: string; name: string },
  ) {
    try {
      const result = await this.messengerService.changeRoomName(
        payload.roomId,
        payload.name,
      );

      const room = await this.messengerService.getChatRoomById(payload.roomId);
      room.user_ids.forEach((userId: string) => {
        this.server.to(`user:${userId}`).emit('chatRoomsUpdated');
      });

      const savedMessage = await this.messengerService.sendMessage(
        payload.roomId,
        client.data.user.id,
        `${client.data.user.username} changed room name to ${payload.name}`,
        MessageType.DEFAULT,
      );
      const messageToEmit = { ...savedMessage, roomId: savedMessage.room_id };

      this.server.to(payload.roomId).emit('newMessage', messageToEmit);
      this.server.to(payload.roomId).emit('roomNameChanged', {
        ...result,
        name: payload.name,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(
        error.message,
        'messenger-gateway',
        'There was an error in changing room name',
        error.stack,
      );
      client.emit('error', {
        success: false,
        message: error.message || 'Error changing room name',
      });
    }
  }
}
