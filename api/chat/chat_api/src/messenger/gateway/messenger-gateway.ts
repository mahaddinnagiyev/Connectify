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
import { MessageType } from 'src/enums/message-type.enum';
import { MessengerService } from '../messenger.service';

@WebSocketGateway(3737, { cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly messengerService: MessengerService) {}

  handleConnection(client: Socket) {
    console.log(`User connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`User disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    client: Socket,
    payload: { user1Id: string; user2Id: string },
  ) {
    try {
      console.log('Payload:', payload);
      const room = await this.messengerService.createChatRoomIfNotExist(
        payload.user1Id,
        payload.user2Id,
      );
      console.log('Room returned:', room);

      if (!room || !room.id) {
        throw new Error('Chat room was not created properly');
      }

      client.join(room.id);
      client.emit('roomJoined', room);
      console.log(`User ${client.id} joined room ${room.id}`);
    } catch (error) {
      console.error('Error in joinRoom:', error);
      if (client) {
        client.emit('error', error.message);
      }
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    client: Socket,
    payload: {
      roomId: string;
      sender_id: string;
      content: string;
      message_type: MessageType;
    },
  ) {
    try {
      const savedMessage = await this.messengerService.sentMessage(
        payload.roomId,
        payload.sender_id,
        payload.content,
        payload.message_type,
      );
      
      this.server.to(payload.roomId).emit('newMessage', savedMessage);
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('getChatRooms')
  async handleGetChatRooms(client: Socket, payload: { token: string }) {
    try {
      const userId = this.validateTokenAndGetUserId(payload.token);
      const chatRooms = await this.messengerService.getChatRoomsForUser(userId);
      client.emit('chatRooms', chatRooms);
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(client: Socket, payload: { roomId: string }) {
    try {
      const messages = await this.messengerService.getMessagesForRoom(
        payload.roomId,
      );
      client.emit('messages', messages);
    } catch (error) {
      client.emit('error', error.message);
    }
  }

  private validateTokenAndGetUserId(token: string): string {
    return token;
  }
}
