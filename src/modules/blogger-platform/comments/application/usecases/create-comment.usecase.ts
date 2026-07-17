import { CreateCommentDto } from '../../dto/create-comment.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { CommentModelType } from '../../domain/comment.entity';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { Inject } from '@nestjs/common';

export class CreateCommentCommand {
  constructor(private readonly dto: CreateCommentDto) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommand> {
  constructor(
    @InjectModel(Comment.name) private readonly CommentModel: CommentModelType,
    @Inject() private readonly commentsRepository: CommentsRepository,
  ) {}
  async execute(command: CreateCommentCommand) {
    const { dto } = command;
    const comment = this.CommentModel.createInstance(dto);
    this.commentsRepository.save(comment);
  }
}
