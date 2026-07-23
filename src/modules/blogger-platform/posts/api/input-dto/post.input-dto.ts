import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty } from 'class-validator';
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

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsNotEmpty()
  @IsMongoId()
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

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsNotEmpty()
  @IsMongoId()
  blogId: string;
}
