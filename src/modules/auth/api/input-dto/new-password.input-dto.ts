import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class NewPasswordInputDto {
  @ApiProperty({ example: 'newPass123', minLength: 6, maxLength: 20 })
  @IsString()
  @Length(6, 20)
  password: string;

  @ApiProperty({ example: 'b3b7c4e2-2d30-4ff8-a7d7-2a0d2cc6a111' })
  @IsString()
  code: string;
}
