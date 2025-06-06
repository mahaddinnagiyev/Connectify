import {
  IsArray,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDTO {
  @IsNotEmpty({ message: 'This field is required' })
  @IsString({ message: 'This field must be string' })
  @MinLength(3, { message: 'This field must be minimum 3 character long' })
  @MaxLength(255, { message: 'This field maximum character length is 255' })
  username_or_email: string;

  @IsNotEmpty({ message: 'Password field is required' })
  @IsString({ message: 'Password field must be string' })
  @MaxLength(255, { message: 'This field maximum character length is 255' })
  password: string;
}

export class LoginWithFaceIDDTO {
  @IsNotEmpty({ message: 'This field is required' })
  @IsString({ message: 'This field must be string' })
  @MinLength(3, { message: 'This field must be minimum 3 character long' })
  @MaxLength(255, { message: 'This field maximum character length is 255' })
  username_or_email_face_id: string;

  @IsNotEmpty({ message: 'Face descriptor field can not be empty' })
  @IsArray({ message: 'Face descriptor must be an array' })
  face_descriptor: number[];
}
