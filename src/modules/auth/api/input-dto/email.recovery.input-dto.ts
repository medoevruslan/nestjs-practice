import { IsEmail, Length } from 'class-validator';

export class EmailRecoveryInputDto {
  @IsEmail()
  email: string;

  @Length(1)
  code: string;
}
