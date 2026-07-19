import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePostDto } from '../../dto/update-post.dto';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class UpdatePostCommand {
  constructor(
    public readonly id: string,
    public dto: UpdatePostDto,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(private readonly postsRepository: PostsRepository) {}

  public async execute(command: UpdatePostCommand) {
    const { id, dto } = command;
    const post = await this.postsRepository.getByIdOrFail(id);
    post.update(dto);
    await this.postsRepository.save(post);
    return post.id;
  }
}
