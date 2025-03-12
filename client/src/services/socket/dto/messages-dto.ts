export enum MessageType {
  TEXT = "text",
  IMAGE = "image",
  AUDIO = "audio",
  FILE = "file",
  VIDEO = "video",
  DEFAULT = "default",
}

export enum MessageStatus {
  PENDING = "pending",
  SENT = "sent",
  RECEIVED = "received",
  READ = "read",
}

export interface MessagesDTO {
  id: string;
  room_id: string;
  sender_id: string;
  parent_message_id: MessagesDTO;
  message_type: MessageType;
  content: string;
  status: MessageStatus;
  message_name: string;
  message_size: number;
  created_at: Date;
  updated_at: Date;
}
