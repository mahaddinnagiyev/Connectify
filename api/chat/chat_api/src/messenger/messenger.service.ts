// messenger.service.ts
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { MessageType } from 'src/enums/message-type.enum';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class MessengerService {
  constructor(private readonly supabase: SupabaseService) {}

  private async validateUsersExist(userIds: string[]): Promise<void> {
    try {
      const { data: users, error } = await this.supabase
        .getClient()
        .from('users')
        .select('id')
        .in('id', userIds);

      if (error || !users || users.length !== userIds.length) {
        throw new NotFoundException('One or more users not found');
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Error validating users: ' + error.message,
      );
    }
  }

  async createChatRoomIfNotExist(user1: string, user2: string) {
    try {
      await this.validateUsersExist([user1, user2]);

      const sortedUserIds = [user1, user2].sort();
      const { data: chatRooms, error } = await this.supabase
        .getClient()
        .from('chat_rooms')
        .select('*')
        .contains('user_ids', sortedUserIds);

      if (error) throw error;
      if (chatRooms.length > 0) return chatRooms[0];

      const { data: newChatRoom, error: createError } = await this.supabase
        .getClient()
        .from('chat_rooms')
        .insert([
          {
            user_ids: sortedUserIds,
            message_ids: [],
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (createError) throw createError;
      return newChatRoom;
    } catch (error) {
      throw new InternalServerErrorException(
        'Chat room operation failed: ' + error.message,
      );
    }
  }

  async validateRoomMembership(roomId: string, userId: string): Promise<void> {
    try {
      const { data: room, error } = await this.supabase
        .getClient()
        .from('chat_rooms')
        .select('user_ids')
        .eq('id', roomId)
        .single();

      if (error) throw new NotFoundException('Chat room not found');
      if (!room.user_ids.includes(userId)) {
        throw new ForbiddenException('User is not a member of this room');
      }
    } catch (error) {
      throw new InternalServerErrorException(
        'Membership validation failed: ' + error.message,
      );
    }
  }

  async sentMessage(
    roomId: string,
    senderId: string,
    content: string,
    messageType: MessageType,
  ) {
    try {
      await this.validateRoomMembership(roomId, senderId);

      const { data, error } = await this.supabase
        .getClient()
        .from('messages')
        .insert([
          {
            room_id: roomId,
            sender_id: senderId,
            content,
            message_type: messageType,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new InternalServerErrorException(
        'Message sending failed: ' + error.message,
      );
    }
  }

  async getChatRoomsForUser(userId: string) {
    try {
      const { data, error } = await this.supabase
        .getClient()
        .from('chat_rooms')
        .select('*')
        .contains('user_ids', [userId]);

      if (error) throw error;
      return data;
    } catch (error) {
      throw new InternalServerErrorException(
        'Chat rooms retrieval failed: ' + error.message,
      );
    }
  }

  async getMessagesForRoom(roomId: string) {
    try {
      const { data, error } = await this.supabase
        .getClient()
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new InternalServerErrorException(
        'Messages retrieval failed: ' + error.message,
      );
    }
  }
}
