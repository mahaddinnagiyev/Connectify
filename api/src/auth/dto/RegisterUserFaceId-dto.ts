import { IsArray, IsNotEmpty } from 'class-validator';

export class RegisterUserFaceIdDTO {
  @IsNotEmpty({ message: 'Face descriptor field can not be empty' })
  @IsArray({ message: 'Face descriptor must be an array' })
  face_descriptor: number[];
}