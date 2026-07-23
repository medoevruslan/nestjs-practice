import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class EmailConfirmationInputDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;
}

export class RegistrationConfirmationInputDto {
  @ApiProperty({ example: 'b3b7c4e2-2d30-4ff8-a7d7-2a0d2cc6a111' })
  @IsString()
  code: string;
}
