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

@WebSocketGateway(3737, {
  cors: true,
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly messengerService: MessengerService,
    private readonly jwtService: JwtService,
    private readonly supabase: SupabaseService,
  ) {}

  /**
   * Socket connection zamanı token-i handshake-dən və ya header-dən çıxarır.
   * @param client - Socket instance
   * @returns Token string və ya null
   */
  private extractToken(client: Socket): string | null {
    return (
      client.handshake.auth?.token ||
      (client.handshake.headers.authorization
        ? client.handshake.headers.authorization.split(' ')[1]
        : null)
    );
  }

  /**
   * Verilən istifadəçi ID-sinə görə istifadəçini doğrulayır.
   * @param userId - İstifadəçi ID-si
   * @returns Doğrulanmış istifadəçi məlumatları
   */
  private async validateUser(userId: string): Promise<IUser> {
    try {
      const { data: user, error } = await this.supabase
        .getUserClient()
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

  /**
   * Socket bağlantısı qurulduqda token-i yoxlayır və istifadəçini doğrulayır.
   * @param client - Socket instance
   */
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
      // Həssas məlumatları çıxarırıq (məsələn, password və s.)
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

  /**
   * Socket bağlantısı kəsildikdə loglama aparır.
   * @param client - Socket instance
   */
  handleDisconnect(client: Socket) {
    this.logger.log(`User disconnected: ${client.id}`);
  }

  /**
   * İstifadəçinin başqa istifadəçi ilə chat otağına qoşulma tələbi.
   * @param client - Socket instance
   * @param payload - { user2Id: string }
   */
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

  /**
   * Mesaj göndərmə tələbi üçün dinləyici.
   * @param client - Socket instance
   * @param payload - { roomId: string, content: string, message_type: MessageType }
   */
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

      this.logger.debug(
        `Send message request from ${client.data.user.id} in room ${payload.roomId}`,
      );

      const savedMessage = await this.messengerService.sendMessage(
        payload.roomId,
        client.data.user.id,
        payload.content,
        payload.message_type,
      );

      // Mesajı otaqda olan bütün istifadəçilərə göndəririk
      this.server.to(payload.roomId).emit('newMessage', savedMessage);
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

  /**
   * İstifadəçinin qatıldığı chat otaqlarını sorğulayan dinləyici.
   * Token artıq bağlantı zamanı doğrulandığı üçün əlavə payload tələb olunmur.
   * @param client - Socket instance
   */
  @SubscribeMessage('getChatRooms')
  async handleGetChatRooms(client: Socket) {
    try {
      const userId = client.data.user?.id;
      if (!userId) {
        throw new UnauthorizedException('User not authenticated');
      }

      const chatRooms = await this.messengerService.getChatRoomsForUser(userId);
      client.emit('chatRooms', chatRooms);
      this.logger.debug(`Chat rooms sent to user ${userId}`);
    } catch (error) {
      this.logger.error('Error in getChatRooms', error);
      client.emit('error', {
        success: false,
        message: error.message || 'Error retrieving chat rooms',
      });
    }
  }

  /**
   * Seçilmiş chat otağındakı mesajları sorğulayan dinləyici.
   * @param client - Socket instance
   * @param payload - { roomId: string }
   */
  @SubscribeMessage('getMessages')
  async handleGetMessages(client: Socket, payload: { roomId: string }) {
    try {
      if (!payload || !payload.roomId) {
        throw new BadRequestException('Missing roomId in payload');
      }

      const messages = await this.messengerService.getMessagesForRoom(
        payload.roomId,
      );
      client.emit('messages', messages);
      this.logger.debug(`Messages sent for room ${payload.roomId}`);
    } catch (error) {
      this.logger.error('Error in getMessages', error);
      client.emit('error', {
        success: false,
        message: error.message || 'Error retrieving messages',
      });
    }
  }
}
