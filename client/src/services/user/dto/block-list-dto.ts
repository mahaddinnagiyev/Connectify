export interface BlockListDTO {
    id: string;
    blocked_id: string;
    first_name: string;
    last_name: string;
    username: string;
    profile_picture: string;
    created_at: Date;
}


export enum BlockAction {
    block = "add",
    unblock = "remove"
}