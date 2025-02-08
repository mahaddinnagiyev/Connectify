export interface Account {
    id: string;
    bio: string;
    location: string;
    profile_picture: string;
    social_links: { name: string; link: string }[];
    last_login: Date;
}