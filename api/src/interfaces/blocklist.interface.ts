import { IUser } from './user.interface';

export interface IBlockList {
  id: string;
  blocker: IUser;
  blocked: IUser;
  created_at: Date;
}
