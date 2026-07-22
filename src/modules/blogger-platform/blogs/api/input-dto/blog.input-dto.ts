import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl, MaxLength } from 'class-validator';
import { IsStringWithTrim } from '../../../../../core/decorators/validation/is-string-with-trim';

export class CreateBlogInputDto {
  @ApiProperty({ example: 'Travel notes', minLength: 1, maxLength: 15 })
  @IsStringWithTrim(1, 15)
  name: string;

  @ApiProperty({
    example: 'Stories and practical tips from short city trips.',
    minLength: 1,
    maxLength: 500,
  })
  @IsStringWithTrim(1, 500)
  description: string;

  @ApiProperty({ example: 'https://example.com', maxLength: 100 })
  @IsNotEmpty()
  @IsUrl()
  @MaxLength(100)
  websiteUrl: string;
}

export class CreatePostByBlogIdInputDto {
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
}

export class UpdateBlogInputDto {
  @ApiProperty({ example: 'Travel notes', minLength: 1, maxLength: 15 })
  @IsStringWithTrim(1, 15)
  name: string;

  @ApiProperty({
    example: 'Updated stories and practical tips from short city trips.',
    minLength: 1,
    maxLength: 500,
  })
  @IsStringWithTrim(1, 500)
  description: string;

  @ApiProperty({ example: 'https://example.com', maxLength: 100 })
  @IsNotEmpty()
  @IsUrl()
  @MaxLength(100)
  websiteUrl: string;
}
