import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateFeedbackDTO {
  @IsNotEmpty({ message: 'First name field can not be empty' })
  @IsString({ message: 'First name must be string' })
  @MinLength(1, { message: 'First name length must be minimum 1' })
  @MaxLength(255, { message: 'First name length must be smaller that 255' })
  first_name: string;

  @IsNotEmpty({ message: 'Last name field can not be empty' })
  @IsString({ message: 'Last name must be string' })
  @MinLength(1, { message: 'Last name length must be minimum 1' })
  @MaxLength(255, { message: 'Last name length must be smaller that 255' })
  last_name: string;

  @IsNotEmpty({ message: 'Email field can not be empty' })
  @IsEmail()
  @MaxLength(255, { message: 'Email length must be smaller that 255' })
  email: string;

  @IsNotEmpty({ message: 'Message field can not be empty' })
  @IsString({ message: 'Message must be string' })
  message: string;
}
