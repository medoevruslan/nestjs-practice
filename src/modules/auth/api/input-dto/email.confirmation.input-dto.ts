import { IsEmail, Length } from 'class-validator';

export class EmailConfirmationDto {
  @IsEmail()
  email: string;

  @Length(1)
  code: string;
}
