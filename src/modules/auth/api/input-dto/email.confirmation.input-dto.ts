import { IsEmail } from 'class-validator';

export class EmailConfirmationInputDto {
  @IsEmail()
  email: string;
}
