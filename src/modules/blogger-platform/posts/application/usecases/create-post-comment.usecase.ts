import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class CreatePostCommentCommand {
  constructor() {}
}

@CommandHandler(CreatePostCommentCommand)
export class CreatePostCommentUseCase implements ICommandHandler<CreatePostCommentCommand> {
  constructor() {}
  async execute(command: CreatePostCommentCommand) {}
}
