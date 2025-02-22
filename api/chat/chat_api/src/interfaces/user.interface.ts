export enum Gender {
  male = 'male',
  female = 'female',
  other = 'other',
  notProvided = 'not provided',
}

export interface IUser {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  gender: Gender;
  is_admin: boolean;
  is_banned: boolean;
  created_at: Date;
}
