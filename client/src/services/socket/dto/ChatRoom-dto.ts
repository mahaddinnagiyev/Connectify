export interface ChatRoomsDTO {
  id: string;
  name?: string;
  user_ids: string[];
  created_at: Date;
  updated_at: Date;
  lastMessage?: string;
}
