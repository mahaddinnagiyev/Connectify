import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageType } from 'src/enums/message-type.enum';
import { MessengerService } from '../messenger.service';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from 'src/supabase/supabase.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from 'src/jwt/jwt-payload';
import { IUser } from 'src/interfaces/user.interface';
import { MessageStatus } from 'src/enums/message-status.enum';
import { WebpushService } from 'src/webpush/webpush.service';
import { LoggerService } from 'src/logger/logger.service';

@WebSocketGateway(3636, {
  cors: {
    origin: 'http://localhost:5173',
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

      await this.supabase
        .getClient()
        .from('accounts')
        .update({ last_login: new Date() })
        .eq('user_id', user.id);

      const { password, is_admin, ...safeUser } = user;
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

        // const recipientSocket = Array.from(
        //   this.server.sockets.sockets.values(),
        // ).find((socket) => socket.data.user?.id === recipientId);

        // if (recipientSocket) {
        //   await this.webPushService.sendPushNotification(recipientId, {
        //     title: `${client.data.user.username} sent you a message`,
        //     body: payload.content,
        //     data: { roomId: payload.roomId },
        //   });
        // }

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
        throw new UnauthorizedException('User not authenticated');
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
  async handleGetMessages(client: Socket, payload: { roomId: string }) {
    try {
      if (!payload || !payload.roomId) {
        throw new BadRequestException('Missing roomId in payload');
      }

      const messages = await this.messengerService.getMessagesForRoom(
        payload.roomId,
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
}
