import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';

export class CommentInputDto {
  @ApiProperty({
    example: 'This post was useful and gave me a clear route to try.',
    minLength: 20,
    maxLength: 300,
  })
  @Length(20, 300)
  content: string;
}
