import { IsEmail, Length, Matches } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform';

export class RegisterUserInputDto {
  @Matches(/^[a-zA-Z0-9_-]*$/)
  @Trim()
  @Length(3, 10)
  login: string;

  @IsEmail()
  email: string;

  @Length(6, 20)
  password: string;
}
