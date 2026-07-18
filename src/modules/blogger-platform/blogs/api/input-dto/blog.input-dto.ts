import { IsNotEmpty, IsUrl, MaxLength } from 'class-validator';
import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';

export class CreateBlogInputDto {
  @IsStringWithTrim(1, 15)
  name: string;

  @IsStringWithTrim(1, 500)
  description: string;

  @IsNotEmpty()
  @IsUrl()
  @MaxLength(100)
  websiteUrl: string;
}

export class CreatePostByBlogIdInputDto {
  @IsStringWithTrim(1, 30)
  title: string;

  @IsStringWithTrim(1, 100)
  shortDescription: string;

  @IsStringWithTrim(1, 1000)
  content: string;
}

export class UpdateBlogInputDto {
  @IsStringWithTrim(1, 15)
  name: string;

  @IsStringWithTrim(1, 500)
  description: string;

  @IsNotEmpty()
  @IsUrl()
  @MaxLength(100)
  websiteUrl: string;
}
