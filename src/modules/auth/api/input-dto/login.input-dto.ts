import { Length } from 'class-validator';
import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';

export class LoginInputDto {
  @IsStringWithTrim(3)
  loginOrEmail: string;

  @Length(6, 20)
  password: string;
}
