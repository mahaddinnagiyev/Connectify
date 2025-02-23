import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ForgotPasswordDTO {
  @IsNotEmpty({ message: 'Email field can not be empty' })
  @IsEmail()
  @MinLength(8, { message: 'Email length must be minimum 8' })
  @MaxLength(255, { message: 'Email length must be smaller that 255' })
  email: string;
}

export class SetNewPasswordDTO {
  @IsNotEmpty({ message: 'Password field can not be empty' })
  @IsString({ message: 'Password must be string' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>'№_;:/-])[A-Za-z\d@$!%*?&]{8,255}$/,
    {
      message:
        'Password must be minimum 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    },
  )
  password: string;
}
