import { IsString, Length, MinLength } from 'class-validator';

export class LoginInputDto {
  @IsString()
  @MinLength(3)
  loginOrEmail: string;

  @Length(6, 20)
  password: string;
}
