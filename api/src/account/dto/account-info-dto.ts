import { IsOptional, IsString, MaxLength } from 'class-validator';

export class EditAccountDTO {
  @IsOptional()
  @IsString({ message: 'Bio must be string' })
  @MaxLength(255, { message: 'Bio length must be smaller than 255' })
  bio?: string;

  @IsOptional()
  @IsString({ message: 'Location must be string' })
  @MaxLength(255, { message: 'Location length must be smaller than 255' })
  location?: string;
}
