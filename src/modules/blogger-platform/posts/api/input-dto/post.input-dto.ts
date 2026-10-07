import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString } from 'class-validator';
import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';

export class CreatePostInputDto {
  @ApiProperty({
    example: 'First weekend in Lisbon',
    minLength: 1,
    maxLength: 30,
  })
  @IsStringWithTrim(1, 30)
  title: string;

  @ApiProperty({
    example: 'A compact route through viewpoints, cafes, and old streets.',
    minLength: 1,
    maxLength: 100,
  })
  @IsStringWithTrim(1, 100)
  shortDescription: string;

  @ApiProperty({
    example: 'Start early near Alfama, then walk toward Baixa before sunset.',
    minLength: 1,
    maxLength: 1000,
  })
  @IsStringWithTrim(1, 1000)
  content: string;

  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  @IsNumberString({ no_symbols: true })
  blogId: string;
}

export class UpdatePostInputDto {
  @ApiProperty({
    example: 'First weekend in Lisbon',
    minLength: 1,
    maxLength: 30,
  })
  @IsStringWithTrim(1, 30)
  title: string;

  @ApiProperty({
    example: 'Updated route through viewpoints, cafes, and old streets.',
    minLength: 1,
    maxLength: 100,
  })
  @IsStringWithTrim(1, 100)
  shortDescription: string;

  @ApiProperty({
    example: 'Start early near Alfama, then walk toward Baixa before sunset.',
    minLength: 1,
    maxLength: 1000,
  })
  @IsStringWithTrim(1, 1000)
  content: string;

  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  @IsNumberString({ no_symbols: true })
  blogId: string;
}
