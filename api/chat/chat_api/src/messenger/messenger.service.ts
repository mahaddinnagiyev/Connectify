// messenger.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MessageType } from 'src/enums/message-type.enum';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class MessengerService {
  constructor(private readonly supabase: SupabaseService) {}

  async createChatRoomIfNotExist(user1: string, user2: string) {
    const sortedUserIds = [user1, user2].sort(); // UUID-ləri sırala

    const { data: chatRoom, error } = await this.supabase
      .getClient()
      .from('chat_rooms')
      .select('*')
      .contains('user_ids', sortedUserIds); // eq əvəzinə contains istifadə et

    if (error) {
      throw new InternalServerErrorException(
        'Error checking existing chat room: ' + error.message,
      );
    }

    if (chatRoom.length > 0) {
      return chatRoom[0];
    }

    const { data: newChatRoom, error: createError } = await this.supabase
      .getClient()
      .from('chat_rooms')
      .insert([{ user_ids: sortedUserIds, message_ids: [] }])
      .select()
      .single();

    if (createError) {
      throw new InternalServerErrorException(
        'Error creating new chat room: ' + createError.message,
      );
    }

    return newChatRoom;
  }

  // Mesajı göndərir və verilənlər bazasına əlavə edir
  async sentMessage(
    roomId: string,
    senderId: string,
    content: string,
    messageType: MessageType,
  ) {
    const { data, error } = await this.supabase
      .getClient()
      .from('messages')
      .insert([
        {
          room_id: roomId,
          sender_id: senderId,
          content,
          message_type: messageType,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw new InternalServerErrorException(
        'Error sending message: ' + error.message,
      );
    }

    return data;
  }

  // İstifadəçinin qatıldığı bütün chat room-ları alırıq
  async getChatRoomsForUser(userId: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('chat_rooms')
      .select('*')
      .contains('user_ids', [userId]);

    if (error) {
      throw new InternalServerErrorException(
        'Error retrieving chat rooms: ' + error.message,
      );
    }

    return data;
  }

  // Seçilmiş chat room-dakı mesajları vaxt sırasına görə qaytarırıq
  async getMessagesForRoom(roomId: string) {
    const { data, error } = await this.supabase
      .getClient()
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new InternalServerErrorException(
        'Error retrieving messages: ' + error.message,
      );
    }

    return data;
  }
}
