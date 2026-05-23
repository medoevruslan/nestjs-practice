import { CreatePostDto } from '../../../posts/dto/create-post.dto';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreatePostCommand } from '../../../posts/application/usecases/create-post.usecase';

export class CreatePostByBlogIdCommand {
  constructor(public readonly dto: CreatePostDto) {}
}

@CommandHandler(CreatePostByBlogIdCommand)
export class CreatePostByBlogIdUseCase implements ICommandHandler<CreatePostByBlogIdCommand> {
  constructor(@Inject() private commandBus: CommandBus) {}

  async execute(command: CreatePostByBlogIdCommand) {
    return this.commandBus.execute<CreatePostCommand, string>(
      new CreatePostCommand(command.dto),
    );
  }
}
