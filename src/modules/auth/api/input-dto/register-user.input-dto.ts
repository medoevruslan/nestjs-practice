import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Length, Matches } from 'class-validator';
import { Trim } from '../../../../core/decorators/transform/trim';

export class RegisterUserInputDto {
  @ApiProperty({ example: 'john_01', minLength: 3, maxLength: 10 })
  @Matches(/^[a-zA-Z0-9_-]*$/)
  @Trim()
  @Length(3, 10)
  login: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'qwerty123', minLength: 6, maxLength: 20 })
  @Length(6, 20)
  password: string;
}
