import { CreatePostDto } from '../../dto/create-post.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../../domain/post.entity';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class CreatePostCommand {
  constructor(public readonly dto: CreatePostDto) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    @Inject() private readonly postsRepository: PostsRepository,
    @Inject() private readonly blogsRepository: BlogsRepository,
    @InjectModel(Post.name) private readonly PostModel: PostModelType,
  ) {}

  async execute(command: CreatePostCommand) {
    const { dto } = command;

    const blog = await this.blogsRepository.getByIdOrNotFoundFail(dto.blogId);

    const post = this.PostModel.createInstance({
      title: dto.title,
      blogId: dto.blogId,
      content: dto.content,
      shortDescription: dto.shortDescription,
      blogName: blog.name,
    });

    await this.postsRepository.save(post);
    return post.id;
  }
}
