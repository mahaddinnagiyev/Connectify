import { IsEnum, IsOptional } from 'class-validator';
import { PrivacySettings } from 'src/enums/privacy-settings.enum';

export class UpdatePrivacySettingsDTO {
  @IsOptional()
  @IsEnum(PrivacySettings, {
    message:
      "Email privacy settings must be one of the following: 'everyone', 'my_friends', 'nobody'",
  })
  email?: PrivacySettings;

  @IsOptional()
  @IsEnum(PrivacySettings, {
    message:
      "Gender privacy settings must be one of the following: 'everyone', 'my_friends', 'nobody'",
  })
  gender?: PrivacySettings;

  @IsOptional()
  @IsEnum(PrivacySettings, {
    message:
      "Bio privacy settings must be one of the following: 'everyone', 'my_friends', 'nobody'",
  })
  bio?: PrivacySettings;

  @IsOptional()
  @IsEnum(PrivacySettings, {
    message:
      "Location privacy settings must be one of the following: 'everyone', 'my_friends', 'nobody'",
  })
  location?: PrivacySettings;

  @IsOptional()
  @IsEnum(PrivacySettings, {
    message:
      "Social link privacy settings must be one of the following: 'everyone', 'my_friends', 'nobody'",
  })
  social_links?: PrivacySettings;

  @IsOptional()
  @IsEnum(PrivacySettings, {
    message:
      "Last login privacy settings must be one of the following: 'everyone', 'my_friends', 'nobody'",
  })
  last_login?: PrivacySettings;
}
