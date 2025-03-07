import { IUser } from './user.interface';

export interface IBlockList {
  id: string;
  blocker_id: IUser;
  blocked_id: IUser;
  created_at: Date;
}
