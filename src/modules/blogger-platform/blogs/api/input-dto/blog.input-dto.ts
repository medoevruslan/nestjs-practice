import {
  IsMongoId,
  IsNotEmpty,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateBlogInputDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(15)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  description: string;

  @IsNotEmpty()
  @IsUrl()
  @MaxLength(100)
  websiteUrl: string;
}

export class CreatePostByBlogIdInputDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  title: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  shortDescription: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(1000)
  content: string;
}

export class UpdateBlogInputDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(15)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  description: string;

  @IsNotEmpty()
  @IsUrl()
  @MaxLength(100)
  websiteUrl: string;
}
