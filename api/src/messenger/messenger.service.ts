import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { MessageStatus } from 'src/enums/message-status.enum';
import { MessageType } from 'src/enums/message-type.enum';
import { LoggerService } from 'src/logger/logger.service';
import { SupabaseService } from 'src/supabase/supabase.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class MessengerService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly logger: LoggerService,
  ) {}

  async getChatRoomById(roomId: string) {
    try {
      const { data: chatRoom, error } = await this.supabase
        .getClient()
        .from('chat_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error) {
        this.logger.error(
          error.message,
          'messenger',
          'There was an error while getting chat room by id from supabase',
          error.stack,
        );
        throw new InternalServerErrorException(
          `Error checking existing chat room: ${error.message}`,
        );
      }

      if (!chatRoom) {
        throw new BadRequestException('Chat room not found');
      }

      return chatRoom;
    } catch (error) {
      this.logger.error(
        error.message,
        'messenger',
        'There was an error in getting chat room by id',
        error.stack,
      );
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Error creating chat room: ${error.message}`,
      );
    }
  }

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
        this.logger.error(
          error.message,
          'messenger',
          'There was an error while getting chat rooms from supabase',
          error.stack,
        );
        throw new InternalServerErrorException(
          `Error checking existing chat room: ${error.message}`,
        );
      }

      if (chatRoom && chatRoom.length > 0) {
        this.logger.debug('Existing chat room found', 'messenger');
        return chatRoom[0];
      }

      const { data: newChatRoom, error: createError } = await this.supabase
        .getClient()
        .from('chat_rooms')
        .insert([{ user_ids: sortedUserIds }])
        .select()
        .single();

      if (createError) {
        this.logger.error(
          error.message,
          'messenger',
          'There was an error while creating new chat room in supabase',
          error.stack,
        );
        throw new InternalServerErrorException(
          `Error creating new chat room: ${createError.message}`,
        );
      }

      const defaultMessage = {
        room_id: newChatRoom.id,
        sender_id: user1,
        content: 'Chat room has been created',
        message_type: MessageType.DEFAULT,
      };

      const { error: messageError } = await this.supabase
        .getClient()
        .from('messages')
        .insert([defaultMessage]);

      if (messageError) {
        this.logger.error(
          error.message,
          'messenger',
          'There was an error while saving new message in supabase',
          error.stack,
        );
      }

      this.logger.debug(
        'New chat room created successfully',
        'messenger',
        `Users ${user1} and ${user2}`,
      );
      return newChatRoom;
    } catch (error) {
      this.logger.error(
        error.message,
        'messenger',
        'There was an error in creating chat room',
        error.stack,
      );
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
    message_name?: string,
    message_size?: number,
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
            message_name,
            message_size,
          },
        ])
        .select()
        .single();

      if (error) {
        this.logger.error(
          error.message,
          'messenger',
          'Error sending message to supabase',
          error.stack,
        );
        throw new InternalServerErrorException(
          `Error sending message: ${error.message}`,
        );
      }

      this.logger.debug('Message sent successfully', 'messenger', data);
      return data;
    } catch (error) {
      this.logger.error(
        error.message,
        'messenger',
        'There was an error in sending message',
        error.stack,
      );
      throw new InternalServerErrorException(
        `Error sending message: ${error.message}`,
      );
    }
  }

  async setMessageRead(roomId: string, userId: string) {
    try {
      const { data } = await this.supabase
        .getClient()
        .from('messages')
        .update({ status: MessageStatus.READ })
        .eq('room_id', roomId)
        .neq('sender_id', userId);

      return data;
    } catch (error) {
      this.logger.error(
        error.message,
        'messenger',
        'There was an error in setting messages as read',
        error.stack,
      );
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

      const roomsWithDetails = await Promise.all(
        chatRooms.map(async (room) => {
          const lastMessage = room.messages.sort(
            (a: any, b: any) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          )[0];

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
            lastMessageDate: lastMessage?.created_at || null,
            lastMessage: lastMessage || null,
          };
        }),
      );

      return roomsWithDetails.sort(
        (a, b) =>
          new Date(b.lastMessageDate || 0).getTime() -
          new Date(a.lastMessageDate || 0).getTime(),
      );
    } catch (error) {
      this.logger.error(
        error.message,
        'messenger',
        'There was an error in retrieving chat rooms',
        error.stack,
      );
      throw new InternalServerErrorException(
        `Error retrieving chat rooms: ${error.message}`,
      );
    }
  }

  async getMessagesForRoom(roomId: string) {
    try {
      const { data } = await this.supabase
        .getClient()
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      this.logger.debug(`Retrieved messages for room ${roomId}`, 'messenger');
      return data;
    } catch (error) {
      this.logger.error(
        error.message,
        'messenger',
        'There was an error in retrieving messages for room',
        error.stack,
      );
      throw new InternalServerErrorException(
        `Error retrieving messages: ${error.message}`,
      );
    }
  }

  async updateMessageStatus(messageId: string, status: MessageStatus) {
    try {
      const { data } = await this.supabase
        .getClient()
        .from('messages')
        .update({ status })
        .eq('id', messageId)
        .select('*')
        .single();

      this.logger.debug('Message status updated successfully', 'messenger');
      return data;
    } catch (error) {
      this.logger.error(
        error.message,
        'messenger',
        'There was an error in updating message status',
        error.stack,
      );
      throw new InternalServerErrorException(
        `Error updating message status: ${error.message}`,
      );
    }
  }

  // Send Another Type Messages
  async uplaodImage(file: Express.Multer.File) {
    try {
      let fileOriginalName: string;

      if (file.originalname.includes(' ')) {
        fileOriginalName = file.originalname.replace(' ', '-');
      }

      const fileName = `${uuid()}-${Date.now()}-${fileOriginalName}`;

      const { data, error } = await this.supabase
        .getClient()
        .storage.from('messages')
        .upload(`images/${fileName}`, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) {
        this.logger.error(
          error.message,
          'messenger',
          'There is an error in uploading image',
          error.stack,
        );
        return new BadRequestException({
          success: false,
          error: error.message,
        });
      }

      const publicUrl = this.supabase
        .getClient()
        .storage.from('messages')
        .getPublicUrl(`images/${fileName}`);

      return {
        publicUrl: publicUrl.data.publicUrl,
        file_name: fileOriginalName,
        file_size: file.size,
      };
    } catch (error) {
      this.logger.error(
        error.message,
        'messenger',
        'There was an error in uploading image',
        error.stack,
      );
      return new InternalServerErrorException(
        'Uploading image failed - Due To Internal Server Error',
      );
    }
  }

  async uplaodVideo(file: Express.Multer.File) {
    try {
      let fileOriginalName: string;

      if (file.originalname.includes(' ')) {
        fileOriginalName = file.originalname.replace(' ', '-');
      }

      const fileName = `${uuid()}-${Date.now()}-${fileOriginalName}`;

      const { data, error } = await this.supabase
        .getClient()
        .storage.from('messages')
        .upload(`videos/${fileName}`, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) {
        this.logger.error(
          error.message,
          'messenger',
          'There is an error in uploading video',
          error.stack,
        );
        return new BadRequestException({
          success: false,
          error: error.message,
        });
      }

      const publicUrl = this.supabase
        .getClient()
        .storage.from('messages')
        .getPublicUrl(`videos/${fileName}`);

      return {
        publicUrl: publicUrl.data.publicUrl,
        file_name: fileOriginalName,
        file_size: file.size,
      };
    } catch (error) {
      this.logger.error(
        error.message,
        'messenger',
        'There was an error in uploading video',
        error.stack,
      );
      return new InternalServerErrorException(
        'Uploading video failed - Due To Internal Server Error',
      );
    }
  }

  async uplaodFile(file: Express.Multer.File) {
    try {
      let fileOriginalName: string;

      if (file.originalname.includes(' ')) {
        fileOriginalName = file.originalname.replace(' ', '-');
      }

      const fileName = `${uuid()}-${Date.now()}-${fileOriginalName}`;

      const { data, error } = await this.supabase
        .getClient()
        .storage.from('messages')
        .upload(`files/${fileName}`, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) {
        this.logger.error(
          error.message,
          'messenger',
          'There is an error in uploading file',
          error.stack,
        );
        return new BadRequestException({
          success: false,
          error: error.message,
        });
      }

      const publicUrl = this.supabase
        .getClient()
        .storage.from('messages')
        .getPublicUrl(`files/${fileName}`);

      return {
        publicUrl: publicUrl.data.publicUrl,
        file_name: fileOriginalName,
        file_size: file.size,
      };
    } catch (error) {
      this.logger.error(
        error.message,
        'messenger',
        'There was an error in uploading file',
        error.stack,
      );
      return new InternalServerErrorException(
        'Uploading file failed - Due To Internal Server Error',
      );
    }
  }

  async uplaodAudio(file: Express.Multer.File) {
    try {
      const fileName = `${uuid()}-${Date.now()}`;

      const { data, error } = await this.supabase
        .getClient()
        .storage.from('messages')
        .upload(`audios/${fileName}`, file.buffer, {
          contentType: file.mimetype,
        });

      if (error) {
        this.logger.error(
          error.message,
          'messenger',
          'There is an error in uploading audio',
          error.stack,
        );
        return new BadRequestException({
          success: false,
          error: error.message,
        });
      }

      const publicUrl = this.supabase
        .getClient()
        .storage.from('messages')
        .getPublicUrl(`audios/${fileName}`);

      return {
        publicUrl: publicUrl.data.publicUrl,
        file_size: file.size,
      };
    } catch (error) {
      this.logger.error(
        error.message,
        'messenger',
        'There was an error in uploading audio',
        error.stack,
      );
      return new InternalServerErrorException(
        'Uploading audio failed - Due To Internal Server Error',
      );
    }
  }
}
