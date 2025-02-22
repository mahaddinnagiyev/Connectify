// chat.gateway.ts
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  ForbiddenException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MessageType } from 'src/enums/message-type.enum';
import { MessengerService } from '../messenger.service';
import { SupabaseService } from 'src/supabase/supabase.service';
import { IUser } from 'src/interfaces/user.interface';
import { JwtPayload } from 'src/jwt/jwt-payload';

@WebSocketGateway(3737, {
  cors: true,
  transports: ['websocket'],
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly messengerService: MessengerService,
    private readonly jwtService: JwtService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) throw new UnauthorizedException('Missing auth token');

      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_ACCESS_SECRET_KEY,
      });

      const user = await this.validateUser(payload.id);
      client.data.user = user;
      this.logger.log(`User connected: ${user.id}`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.emit('error', {
        status: error.response?.statusCode || 500,
        message: error.message,
      });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`User disconnected: ${client.id}`);
  }

  private extractToken(client: Socket): string | null {
    return (
      client.handshake.auth.token ||
      client.handshake.headers.authorization?.split(' ')[1]
    );
  }

  private async validateUser(userId: string): Promise<IUser> {
    try {
      const { data: user } = await this.supabaseService
        .getClient()
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!user) throw new UnauthorizedException('User not found');
      return user;
    } catch (error) {
      throw new UnauthorizedException('User validation failed');
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, @MessageBody() otherUserId: string) {
    try {
      const currentUser = client.data.user;
      if (!currentUser)
        throw new UnauthorizedException('Authentication required');

      const room = await this.messengerService.createChatRoomIfNotExist(
        currentUser.id,
        otherUserId,
      );

      client.join(room.id);
      client.emit('roomJoined', room);
      this.logger.log(`User ${currentUser.id} joined room ${room.id}`);
    } catch (error) {
      this.handleError(client, error);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    client: Socket,
    @MessageBody()
    payload: { roomId: string; content: string; messageType: MessageType },
  ) {
    try {
      const currentUser = client.data.user;
      if (!currentUser)
        throw new UnauthorizedException('Authentication required');

      const savedMessage = await this.messengerService.sentMessage(
        payload.roomId,
        currentUser.id,
        payload.content,
        payload.messageType,
      );

      this.server.to(payload.roomId).emit('newMessage', savedMessage);
      this.logger.log(`Message sent to room ${payload.roomId}`);
    } catch (error) {
      this.handleError(client, error);
    }
  }

  @SubscribeMessage('getChatRooms')
  async handleGetChatRooms(client: Socket) {
    try {
      const currentUser = client.data.user;
      if (!currentUser)
        throw new UnauthorizedException('Authentication required');

      const chatRooms = await this.messengerService.getChatRoomsForUser(
        currentUser.id,
      );
      client.emit('chatRooms', chatRooms);
    } catch (error) {
      this.handleError(client, error);
    }
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(client: Socket, @MessageBody() roomId: string) {
    try {
      const currentUser = client.data.user;
      if (!currentUser)
        throw new UnauthorizedException('Authentication required');

      await this.messengerService.validateRoomMembership(
        roomId,
        currentUser.id,
      );
      const messages = await this.messengerService.getMessagesForRoom(roomId);
      client.emit('messages', messages);
    } catch (error) {
      this.handleError(client, error);
    }
  }

  private handleError(client: Socket, error: Error): void {
    const errorData = {
      status: 500,
      message: 'Internal server error',
    };

    if (error instanceof UnauthorizedException) {
      errorData.status = 401;
      errorData.message = error.message;
    } else if (error instanceof ForbiddenException) {
      errorData.status = 403;
      errorData.message = error.message;
    } else if (error instanceof NotFoundException) {
      errorData.status = 404;
      errorData.message = error.message;
    }

    client.emit('error', errorData);
    this.logger.error(`Client error: ${error.message}`);
  }
}
