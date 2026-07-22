import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Length, Matches } from 'class-validator';

export class CreateUserInputDto {
  @ApiProperty({ example: 'john_01', minLength: 3, maxLength: 10 })
  @Length(3, 10)
  @Matches(/^[a-zA-Z0-9_-]*$/)
  login: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'qwerty123', minLength: 6, maxLength: 20 })
  @Length(6, 20)
  password: string;
}
