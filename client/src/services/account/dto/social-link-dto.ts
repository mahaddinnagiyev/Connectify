export interface SocialLink {
  id: string;
  name: string;
  link: string;
}

export interface SocialLinkDTO {
  name: string;
  link: string;
}

export interface EditSocialDTO {
  name?: string;
  link?: string;
}
