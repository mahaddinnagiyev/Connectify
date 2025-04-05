import { Account } from "../../account/dto/account-dto";
import { Gender } from "../../auth/dto/singup-dto";

export interface Users {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  gender: Gender;
  created_at: Date;
  account: Account;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  gender: Gender;
  created_at: Date;
  face_descriptor?: number[];
}

export interface EditUser {
  first_name?: string;
  last_name?: string;
  username?: string;
  gender?: Gender;
}
