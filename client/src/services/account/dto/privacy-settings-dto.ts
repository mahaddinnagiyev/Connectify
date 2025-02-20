export enum PrivacySettings {
    everyone = 'everyone',
    my_friends = 'my_friends',
    nobody = 'nobody'
}

export interface PrivacySettingsDTO {
    email: PrivacySettings;
    gender: PrivacySettings;
    bio: PrivacySettings;
    location: PrivacySettings;
    social_links: PrivacySettings;
}

export interface EditPrivacySettingsDTO {
    email?: PrivacySettings;
    gender?: PrivacySettings;
    bio?: PrivacySettings;
    location?: PrivacySettings;
    social_links?: PrivacySettings;
}