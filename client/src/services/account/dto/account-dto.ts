import { PrivacySettingsDTO } from "./privacy-settings-dto";

export interface Account {
  id: string;
  bio: string;
  location: string;
  profile_picture: string;
  social_links: { id: string; name: string; link: string }[];
  last_login: Date;
  privacy?: PrivacySettingsDTO;
}

export interface EditAccountDTO {
  bio?: string;
  location?: string;
}
