import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { MessageStatus } from 'src/enums/message-status.enum';
import { MessageType } from 'src/enums/message-type.enum';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class MessengerService {
  private readonly logger = new Logger(MessengerService.name);

  constructor(private readonly supabase: SupabaseService) {}

  async createChatRoomIfNotExist(user1: string, user2: string) {
    if (user1 === user2) {
      throw new BadRequestException(
        'Cannot create a chat room with the same user.',
      );
    }

    const sortedUserIds = [user1, user2].sort();

    try {
      const { data: chatRoom, error } = await this.supabase
        .getClient()
        .from('chat_rooms')
        .select('*')
        .contains('user_ids', sortedUserIds);

      if (error) {
        this.logger.error('Error checking existing chat room', error);
        throw new InternalServerErrorException(
          `Error checking existing chat room: ${error.message}`,
        );
      }

      if (chatRoom && chatRoom.length > 0) {
        this.logger.debug('Existing chat room found');
        return chatRoom[0];
      }

      const { data: newChatRoom, error: createError } = await this.supabase
        .getClient()
        .from('chat_rooms')
        .insert([{ user_ids: sortedUserIds }])
        .select()
        .single();

      if (createError) {
        this.logger.error('Error creating new chat room', createError);
        throw new InternalServerErrorException(
          `Error creating new chat room: ${createError.message}`,
        );
      }

      this.logger.debug('New chat room created successfully');
      return newChatRoom;
    } catch (error) {
      this.logger.error('Exception in createChatRoomIfNotExist', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error creating chat room: ${error.message}`,
      );
    }
  }

  async sendMessage(
    roomId: string,
    senderId: string,
    content: string,
    messageType: MessageType,
  ) {
    try {
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
        this.logger.error('Error sending message', error);
        throw new InternalServerErrorException(
          `Error sending message: ${error.message}`,
        );
      }

      this.logger.debug('Message sent successfully');
      return data;
    } catch (error) {
      this.logger.error('Exception in sendMessage', error);
      throw new InternalServerErrorException(
        `Error sending message: ${error.message}`,
      );
    }
  }

  async setMessageRead(roomId: string, userId: string) {
    try {
      const { data, error } = await this.supabase
        .getClient()
        .from('messages')
        .update({ status: MessageStatus.READ })
        .eq('room_id', roomId)
        .neq('sender_id', userId);

      if (error) {
        this.logger.error('Error updating messages to read', error);
        throw new InternalServerErrorException(
          'Error setting messages as read',
        );
      }
      return data;
    } catch (error) {
      this.logger.error('Exception in setMessageRead', error);
      throw new InternalServerErrorException('Error setting messages as read');
    }
  }

  async getChatRoomsForUser(userId: string) {
    try {
      const { data: chatRooms } = await this.supabase
        .getClient()
        .from('chat_rooms')
        .select('*, messages!inner(*)')
        .contains('user_ids', [userId]);

      return Promise.all(
        chatRooms.map(async (room) => {
          const { count } = await this.supabase
            .getClient()
            .from('messages')
            .select('*', { count: 'exact' })
            .eq('room_id', room.id)
            .neq('sender_id', userId)
            .neq('status', MessageStatus.READ);

          return {
            ...room,
            unreadCount: count,
            lastMessageDate:
              room.messages[room.messages.length - 1]?.created_at,
            lastMessage: room.messages[room.messages.length - 1] || null,
          };
        }),
      );
    } catch (error) {
      console.log(error);
      this.logger.error('Exception in getChatRoomsForUser', error);
      throw new InternalServerErrorException(
        `Error retrieving chat rooms: ${error.message}`,
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

      if (error) {
        this.logger.error('Error retrieving messages', error);
        throw new InternalServerErrorException(
          `Error retrieving messages: ${error.message}`,
        );
      }

      this.logger.debug(`Retrieved messages for room ${roomId}`);
      return data;
    } catch (error) {
      this.logger.error('Exception in getMessagesForRoom', error);
      throw new InternalServerErrorException(
        `Error retrieving messages: ${error.message}`,
      );
    }
  }

  async updateMessageStatus(messageId: string, status: MessageStatus) {
    try {
      const { data, error } = await this.supabase
        .getClient()
        .from('messages')
        .update({ status })
        .eq('id', messageId)
        .select('*')
        .single();

      if (error) {
        this.logger.error('Error updating message status', error);
        throw new InternalServerErrorException(
          `Error updating message status: ${error.message}`,
        );
      }

      this.logger.debug('Message status updated successfully');
      return data;
    } catch (error) {
      this.logger.error('Exception in updateMessageStatus', error);
      throw new InternalServerErrorException(
        `Error updating message status: ${error.message}`,
      );
    }
  }
}
