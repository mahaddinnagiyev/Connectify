import { FriendshipStatus } from "../enum/friendship-status.enum";

export interface UserFriendsDTO {
    id: string;
    friend_id: string;
    first_name: string;
    last_name: string;
    username: string;
    profile_picture: string;
    status: FriendshipStatus;
    created_at: Date;
    updated_at: Date;
}