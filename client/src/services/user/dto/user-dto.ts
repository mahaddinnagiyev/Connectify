import { Gender } from "../../auth/dto/singup-dto";

export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    gender: Gender;
    created_at: Date
}


export interface EditUser {
    first_name?: string;
    last_name?: string;
    username?: string;
    gender?: Gender;
}