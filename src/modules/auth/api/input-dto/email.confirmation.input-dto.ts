import { IsEmail, Length } from 'class-validator';

export class EmailConfirmationInputDto {
  @IsEmail()
  email: string;

  @Length(1)
  code: string;
}
