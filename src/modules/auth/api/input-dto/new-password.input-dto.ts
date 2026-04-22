import { IsString, Length } from 'class-validator';

export class NewPasswordInputDto {
  @IsString()
  @Length(6, 20)
  password: string;

  @IsString()
  code: string;
}
