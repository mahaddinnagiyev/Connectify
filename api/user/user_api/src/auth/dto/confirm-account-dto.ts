import {
  IsNotEmpty,
  IsNumber,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ConfirmAccountDTO {

    @IsNumber()
    @IsNotEmpty({ message: "Confirm code field can not be empty" })
    code: number
}