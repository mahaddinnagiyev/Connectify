export interface IFeedback {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  message: string;
  is_read: boolean;
  is_answered: boolean;
  created_at: Date;
}
