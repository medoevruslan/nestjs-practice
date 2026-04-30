import { Length } from 'class-validator';

export class NewPasswordDto {
  @Length(6, 20)
  password: string;

  @Length(1)
  code: string;
}
