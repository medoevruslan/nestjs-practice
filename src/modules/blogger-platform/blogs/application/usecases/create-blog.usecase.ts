import { CreateBlogDto } from '../../dto/create-blog.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../../domain/blog.entity';
import { Inject } from '@nestjs/common';

export class CreateBlogCommand {
  constructor(public readonly dto: CreateBlogDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<
  CreateBlogCommand,
  string
> {
  constructor(
    @Inject() private readonly blogsRepository: BlogsRepository,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
  ) {}

  async execute(command: CreateBlogCommand) {
    const { dto } = command;
    const blog = this.BlogModel.createInstance({
      name: dto.name,
      websiteUrl: dto.websiteUrl,
      description: dto.description,
    });

    await this.blogsRepository.save(blog);
    return blog.id;
  }
}
