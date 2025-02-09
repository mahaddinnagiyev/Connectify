export interface Account {
    id: string;
    bio: string;
    location: string;
    profile_picture: string;
    social_links: { id: string, name: string; link: string }[];
    last_login: Date;
}


export interface EditAccountDTO {
    bio?: string;
    location?: string;
}