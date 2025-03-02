import { IsObject, IsString } from 'class-validator';

export class SubscriptionDTO {
  @IsString({ message: 'Title must be string' })
  title: string;

  @IsString({ message: 'Body must be string' })
  body: string;

  @IsObject({ message: 'Data must be object' })
  data: { [key: string]: string };
}
