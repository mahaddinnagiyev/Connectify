import { IPrivacySettings } from "./privacy-settings.interface";
import { IUser } from "./user.interface";

export interface IAccount {
  id: string;
  user: IUser;
  bio?: string;
  location?: string;
  profile_picture?: string;
  social_links?: { id: string; name: string; link: string }[];
  last_login?: Date;
  privacy: IPrivacySettings;
  created_at: Date;
  updated_at: Date;
}
