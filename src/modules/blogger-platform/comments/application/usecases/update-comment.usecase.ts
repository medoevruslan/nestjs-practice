import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { CommentsRepository } from '../../infrastructure/comments.repository';

export class UpdateCommentCommand {
  constructor(
    public readonly commentId: string,
    public readonly userId: string,
    public readonly content: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand> {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(command: UpdateCommentCommand): Promise<void> {
    const comment = await this.commentsRepository.getByIdOrFail(
      command.commentId,
    );

    if (comment.userId.toString() !== command.userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'You can update only your own comment',
      });
    }

    comment.content = command.content;
    await this.commentsRepository.save(comment);
  }
}
