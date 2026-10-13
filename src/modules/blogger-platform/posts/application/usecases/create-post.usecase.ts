import { CreatePostDto } from '../../dto/create-post.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class CreatePostCommand {
  constructor(public readonly dto: CreatePostDto) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    @Inject() private readonly blogsRepository: BlogsRepository,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async execute(command: CreatePostCommand) {
    const { dto } = command;

    const blog = await this.blogsRepository.getByIdOrNotFoundFail(dto.blogId);

    const [created] = await this.dataSource.query(
      `INSERT INTO posts (blog_id, content, short_description, title) VALUES ($1, $2, $3, $4) RETURNING id::TEXT AS id`,
      [blog.id, dto.content, dto.shortDescription, dto.title],
    );

    return created.id;
  }
}
