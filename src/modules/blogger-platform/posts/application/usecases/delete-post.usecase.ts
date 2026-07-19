import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { Inject } from '@nestjs/common';

export class DeletePostCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(@Inject() private readonly postsRepository: PostsRepository) {}

  async execute(command: DeletePostCommand) {
    const post = await this.postsRepository.getByIdOrFail(command.id);
    post.markDeleted();
    await this.postsRepository.save(post);
    return post.id;
  }
}
