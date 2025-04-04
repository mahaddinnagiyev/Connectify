import { PrivacySettings } from "src/enums/privacy-settings.enum";
import { IAccount } from "./account.interface";

export interface IPrivacySettings {
  id: string;
  account: IAccount;
  email: PrivacySettings;
  gender: PrivacySettings;
  bio: PrivacySettings;
  location: PrivacySettings;
  social_links: PrivacySettings;
  last_login: PrivacySettings;
  created_at: Date;
  updated_at: Date;
}
