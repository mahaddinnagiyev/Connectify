import { Gender } from 'src/enums/gender.enum';
import { Provider } from 'src/enums/provider.enum';
import { IAccount } from './account.interface';
import { IFriendship } from './friendship.interface';
import { IBlockList } from './blocklist.interface';

export interface IUser {
  id?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  gender?: Gender;
  is_admin?: boolean;
  is_banned?: boolean;
  password?: string;
  account?: IAccount;
  sentFriendRequests?: IFriendship[];
  receivedFriendRequests?: IFriendship[];
  outgoingBlocks?: IBlockList[];
  incomingBlocks?: IBlockList[];
  provider?: Provider;
  reset_token?: string;
  reset_token_expiration?: Date;
  created_at?: Date;
  updated_at?: Date;
}
