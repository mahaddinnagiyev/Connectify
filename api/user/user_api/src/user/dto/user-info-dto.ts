import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Gender } from 'src/enums/gender.enum';

export class EditUserInfoDTO {
  @IsOptional()
  @IsString({ message: 'First name must be string' })
  @IsNotEmpty({ message: 'First name field can not be empty' })
  @MinLength(2, { message: 'First name length must be minimum 2' })
  @MaxLength(255, { message: 'First name length must be smaller that 255' })
  first_name?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be string' })
  @IsNotEmpty({ message: 'Last name field can not be empty' })
  @MinLength(2, { message: 'Last name length must be minimum 2' })
  @MaxLength(255, { message: 'Last name length must be smaller that 255' })
  last_name?: string;

  @IsOptional()
  @IsString({ message: 'Username must be string' })
  @IsNotEmpty({ message: 'Username field can not be empty' })
  @MinLength(3, { message: 'Username length must be minimum 3' })
  @MaxLength(255, { message: 'Username length must be smaller that 255' })
  @Matches(/^[^\s.,?()$:;"'{}[\]=+&!\\|/<>`~@#№%^]+$/, {
    message:
      'Username can not contain spaces or special characters like (.,?()$:;"\'{}[]-=+&!\\|/<>`~@#№%^) ',
  })
  username?: string;

  @IsOptional()
  @IsEnum(Gender, {
    message:
      "Gender must be one of the following: 'male', 'female', 'other'",
  })
  gender?: Gender;
}
