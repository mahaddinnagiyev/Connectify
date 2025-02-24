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
import {
  BadRequestException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtPayload } from 'src/jwt/jwt-payload';
import { IUser } from 'src/interfaces/user.interface';

@WebSocketGateway(3636, {
  cors: {
    origin: '*',
    allowedHeaders: ['Authorization'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly messengerService: MessengerService,
    private readonly jwtService: JwtService,
    private readonly supabase: SupabaseService,
  ) {}

  private extractToken(client: Socket): string | null {
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers.authorization?.split(' ')[1] ||
      null;

    console.log(token);

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
        this.logger.warn(`User validation failed: ${error?.message}`);
        throw new UnauthorizedException('User not found');
      }
      return user;
    } catch (error) {
      this.logger.error('User validation error', error);
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
      this.logger.log(`Client connected: ${client.id} (User: ${user.id})`);
    } catch (error) {
      this.logger.error('Connection error', error);
      client.emit('error', {
        success: false,
        status: error.response?.statusCode || 500,
        error: error.message,
      });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`User disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, payload: { user2Id: string }) {
    try {
      if (!payload || !payload.user2Id) {
        throw new BadRequestException('Missing user2Id in payload');
      }
      this.logger.debug(
        `Join room request from ${client.data.user.id} with ${payload.user2Id}`,
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

      client.join(room.id);

      await this.messengerService.setMessageRead(room.id);
      client.emit('roomJoined', room);
      this.logger.log(`User ${client.id} joined room ${room.id}`);
    } catch (error) {
      this.logger.error('Error in joinRoom', error);
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
    payload: { roomId: string; content: string; message_type: MessageType },
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
      );

      const savedMessage = await this.messengerService.sendMessage(
        payload.roomId,
        client.data.user.id,
        payload.content,
        payload.message_type,
      );

      const messageToEmit = { ...savedMessage, roomId: savedMessage.room_id };
      this.server.to(payload.roomId).emit('newMessage', messageToEmit);
      this.logger.debug(
        `Message sent in room ${payload.roomId}: ${JSON.stringify(savedMessage)}`,
      );
    } catch (error) {
      this.logger.error('Error in sendMessage', error);
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
      this.logger.debug(`Chat rooms sent to user ${userId}`);
    } catch (error) {
      this.logger.error('Error in getChatRooms', error);
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
      this.logger.debug(`Messages sent for room ${payload.roomId}`);
    } catch (error) {
      this.logger.error('Error in getMessages', error);
      client.emit('error', {
        success: false,
        message: error.message || 'Error retrieving messages',
      });
    }
  }

  @SubscribeMessage('getLastMessage')
  async handleGetLastMessage(client: Socket, payload: { roomId: string }) {
    try {
      const lastMessage = await this.messengerService.getLastMessageForRoom(
        payload.roomId,
      );
      client.emit('lastMessage', { roomId: payload.roomId, lastMessage });
    } catch (error) {
      this.logger.error('Error in getMessages', error);
      client.emit('error', {
        success: false,
        message: error.message || 'Error retrieving last message',
      });
    }
  }
}
