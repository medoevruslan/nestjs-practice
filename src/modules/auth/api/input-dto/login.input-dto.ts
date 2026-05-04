import { IsString, Length, MinLength } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform';

export class LoginInputDto {
  @IsString()
  @Trim()
  @MinLength(3)
  loginOrEmail: string;

  @Length(6, 20)
  password: string;
}
