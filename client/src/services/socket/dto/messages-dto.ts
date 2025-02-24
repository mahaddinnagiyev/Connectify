export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  AUDIO = "audio",
  FILE = "file",
}

export enum MessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  RECEIVED = 'received',
  READ = 'read',
}

export interface MessagesDTO {
  id: string;
  room_id: string;
  sender_id: string;
  message_type: MessageType;
  content: string;
  status: MessageStatus;
  created_at: Date;
  updated_at: Date;
}
