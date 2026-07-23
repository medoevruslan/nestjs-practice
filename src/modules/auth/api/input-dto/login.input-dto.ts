import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';
import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';

export class LoginInputDto {
  @ApiProperty({ example: 'john_01', minLength: 3 })
  @IsStringWithTrim(3)
  loginOrEmail: string;

  @ApiProperty({ example: 'qwerty123', minLength: 6, maxLength: 20 })
  @Length(6, 20)
  password: string;
}
