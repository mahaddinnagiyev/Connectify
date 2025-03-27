import { IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";
import { Gender } from "../../enums/gender.enum";

export class GoogleSignupDTO {
    
    @IsString({ message: "Username must be string" })
    @IsNotEmpty({ message: "Username field can not be empty" })
    @MinLength(3, {message: "Username length must be minimum 3"})
    @MaxLength(255, { message: "Username length must be smaller that 255" })
    username: string;
    
    
    @IsEnum(Gender, { message: "Gender must be one of the following: 'male', 'female', or 'other'" })
    gender: Gender;
}