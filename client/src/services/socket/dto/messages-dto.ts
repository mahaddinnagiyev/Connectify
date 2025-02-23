export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  AUDIO = "audio",
  FILE = "file",
}

export enum MessageStatus {
  PENDING = "pending",
  SENT = "sent",
  RECIEVED = "recieved",
  READ = "read",
}

export interface MessagesDTO {
  id: string;
  room_id: string;
  sender_id: string;
  message_type: MessageType;
  content: string;
  message_status: MessageStatus;
  created_at: Date;
  updated_at: Date;
}
