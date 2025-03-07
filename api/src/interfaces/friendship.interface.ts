import { FriendshipStatus } from "src/enums/friendship-status.enum";
import { IUser } from "./user.interface";

export interface IFriendship {
  id: string;
  requester_id: IUser;
  requestee_id: IUser;
  status: FriendshipStatus;
  created_at: Date;
  updated_at: Date;
}
