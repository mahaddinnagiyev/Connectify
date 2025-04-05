import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { MessageStatus } from '../enums/message-status.enum';
import { MessageType } from '../enums/message-type.enum';
import { IMessage } from '../interfaces/message.interface';
import { LoggerService } from '../logger/logger.service';
import { SupabaseService } from '../supabase/supabase.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class MessengerService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly logger: LoggerService,
  ) {}

  async getMessageById(id: string) {
    try {
      const { data: message } = (await this.supabase
        .getClient()
        .from('messages')
        .select('*')
        .eq('id', id)
        .single()) as { data: IMessage };

      if (!message) {
        await this.logger.warn(
          'Message not found',
          'messenger',
          `Message Not Found\nMessage ID: ${id}`,
        );
        return new NotFoundException({
          success: false,
          error: 'Message not found',
        });
      }

      return {
        success: true,
        message: message,
      };
    } catch (error) {
      await this.logger.error(
        error.message,
        'messenger',
        'There was an error in getting message by id',
        error.stack,
      );
      return new InternalServerErrorException(
        `Error getting message by id: ${error.message}`,
      );
    }
  }

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
        return new InternalServerErrorException(
          `Error checking existing chat room: ${error.message}`,
        );
      }

      if (!chatRoom) {
        return new BadRequestException('Chat room not found');
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
        return error;
      }
      return new InternalServerErrorException(
        `Error creating chat room: ${error.message}`,
      );
    }
  }

  async createChatRoomIfNotExist(user1: string, user2: string) {
    if (user1 === user2) {
      return new BadRequestException(
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
        return new InternalServerErrorException(
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
        return new InternalServerErrorException(
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
        return error;
      }
      return new InternalServerErrorException(
        `Error creating chat room: ${error.message}`,
      );
    }
  }

  async sendMessage(
    roomId: string,
    senderId: string,
    content: string,
    messageType: MessageType,
    parent_message_id?: string,
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
            parent_message_id,
            content,
            message_type: messageType,
            message_name,
            message_size,
          },
        ])
        .select('*, parent_message_id!left(*)')
        .single();

      if (error) {
        this.logger.error(
          error.message,
          'messenger',
          'Error sending message to supabase',
          error.stack,
        );
        return new InternalServerErrorException(
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
      return new InternalServerErrorException(
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
      return new InternalServerErrorException('Error setting messages as read');
    }
  }

  async getChatRoomsForUser(userId: string) {
    try {
      const { data: chatRooms } = await this.supabase
        .getClient()
        .from('chat_rooms')
        .select('id, user_ids')
        .contains('user_ids', [userId]);

      if (!chatRooms || chatRooms.length === 0) return [];

      const roomsWithDetails = await Promise.all(
        chatRooms.map(async (room) => {
          const { data: lastMessageData } = await this.supabase
            .getClient()
            .from('messages')
            .select('*')
            .eq('room_id', room.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          const { data: count } = await this.supabase
            .getClient()
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('room_id', room.id)
            .neq('sender_id', userId)
            .eq('status', 'UNREAD');

          return {
            ...room,
            lastMessageDate: lastMessageData?.created_at || null,
            lastMessage: lastMessageData || null,
            unreadCount: count || 0,
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
      return new InternalServerErrorException(
        `Error retrieving chat rooms: ${error.message}`,
      );
    }
  }

  async getMessagesForRoom(roomId: string, limit: number = 30) {
    try {
      const { data } = await this.supabase
        .getClient()
        .from('messages')
        .select('*, parent_message_id!left(*)')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .limit(limit);

      this.logger.debug(`Retrieved messages for room ${roomId}`, 'messenger');
      return data.reverse();
    } catch (error) {
      this.logger.error(
        error.message,
        'messenger',
        'There was an error in retrieving messages for room',
        error.stack,
      );
      return new InternalServerErrorException(
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
      return new InternalServerErrorException(
        `Error updating message status: ${error.message}`,
      );
    }
  }

  async unsendMessage(roomId: string, messageId: string, sender_id: string) {
    try {
      const { data: message } = (await this.supabase
        .getClient()
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .eq('room_id', roomId)
        .single()) as { data: IMessage };

      if (!message) {
        await this.logger.warn(
          'Message not found',
          'messenger',
          `Message Not Found\nMessage ID: ${messageId}\nRoom ID: ${roomId}`,
        );
        throw new NotFoundException('Message not found');
      }

      if (message.sender_id !== sender_id) {
        throw new ForbiddenException(
          'You are not allowed to delete this message',
        );
      }

      const { data: childMessages } = (await this.supabase
        .getClient()
        .from('messages')
        .select('*')
        .eq('parent_message_id', messageId)) as { data: IMessage[] };

      if (childMessages.length > 0) {
        for (const childMessage of childMessages) {
          await this.supabase
            .getClient()
            .from('messages')
            .update({
              parent_message_id: null,
              is_parent_deleted: true,
            })
            .eq('id', childMessage.id);
        }
        await this.supabase
          .getClient()
          .from('messages')
          .update({
            is_deleted: true,
          })
          .eq('id', messageId)
          .eq('room_id', roomId);
      }

      if (message.message_type !== MessageType.TEXT) {
        const publicUrl = message.content;
        const bucketPathIdentifier = '/public/messages/';
        const index = publicUrl.indexOf(bucketPathIdentifier);
        if (index !== -1) {
          const filePath = publicUrl.substring(
            index + bucketPathIdentifier.length,
          );
          const { error: deleteError } = await this.supabase
            .getClient()
            .storage.from('messages')
            .remove([filePath]);
          if (deleteError) {
            await this.logger.error(
              deleteError.message,
              'messenger',
              'Error deleting file from storage',
              deleteError.stack,
            );
          }
        } else {
          await this.logger.warn(
            'Public URL does not contain expected bucket path',
            'messenger',
            `Message ID: ${messageId}\nPublic URL: ${publicUrl}`,
          );
        }
      }

      await this.supabase
        .getClient()
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('room_id', roomId);

      this.logger.debug(
        'Message unsent successfully',
        'messenger',
        `Message ID: ${messageId}\nRoom ID: ${roomId}\nUser ID: ${message.sender_id}\nContent: ${message.content}\nMessage Type: ${message.message_type}`,
      );

      return { success: true, message: 'Message unsent successfully' };
    } catch (error) {
      this.logger.error(
        error.message,
        'messenger',
        'Error unsending message',
        error.stack,
      );
      throw new InternalServerErrorException(
        `Error unsending message: ${error.message}`,
      );
    }
  }

  // Send Another Type Messages
  async uploadImage(file: Express.Multer.File) {
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

  async uploadVideo(file: Express.Multer.File) {
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

  async uploadFile(file: Express.Multer.File) {
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
