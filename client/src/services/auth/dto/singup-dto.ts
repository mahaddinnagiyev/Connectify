export enum Gender {
    male = "male",
    female = "female",
    other = "other",
    preferNotToSay = "prefer not to say"
}

export interface SignupDTO {
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    gender: Gender;
    password: string;
    confirm: string
}