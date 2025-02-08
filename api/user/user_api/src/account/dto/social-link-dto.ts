import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SocialLinkDTO {
  @IsString({ message: 'Social link must be string' })
  @IsNotEmpty({ message: 'Social link field can not be empty' })
  @MinLength(1, { message: 'Social link length must be minimum 1' })
  @MaxLength(255, { message: 'Social link length must be smaller that 255' })
  name: string;

  @IsString({ message: 'Social link must be string' })
  @IsNotEmpty({ message: 'Social link field can not be empty' })
  @MinLength(10, { message: 'Social link length must be minimum 10' })
  @MaxLength(255, { message: 'Social link length must be smaller that 255' })
  link: string;
}

export class EditSocialLinkDTO {
  @IsOptional()
  @IsString({ message: 'Social link must be string' })
  @Transform(({ value }) => (value === null ? undefined : value)) // null dəyərləri undefined edir
  name?: string;

  @IsOptional()
  @IsString({ message: 'Social link must be string' })
  @MinLength(10, { message: 'Social link length must be minimum 10' })
  @MaxLength(255, { message: 'Social link length must be smaller than 255' })
  @Transform(({ value }) => (value === null ? undefined : value)) // null dəyərləri undefined edir
  link?: string;
}
