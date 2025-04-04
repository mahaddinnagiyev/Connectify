import { MessageType } from 'src/enums/message-type.enum';
import { IChatRoom } from './chat-room.interface';
import { IUser } from './user.interface';
import { MessageStatus } from 'src/enums/message-status.enum';

export interface IMessage {
  id: string;
  room_id: IChatRoom;
  sender_id: IUser;
  parent_message_id: IMessage;
  is_parent_deleted: boolean;
  message_type: MessageType;
  content: string;
  status: MessageStatus;
  message_name: string;
  message_size: number;
  created_at: Date;
  updated_at: Date;
}
