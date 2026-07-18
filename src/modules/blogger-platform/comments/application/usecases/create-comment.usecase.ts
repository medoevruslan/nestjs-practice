import { CreateCommentDto } from '../../dto/create-comment.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../../domain/comment.entity';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { Inject } from '@nestjs/common';
import { CreateCommentDomainDto } from '../../domain/dto/create-comment.domain-dto';
import { UsersService } from 'src/modules/user-account/application/users.service';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';

export class CreateCommentCommand {
  constructor(readonly dto: CreateCommentDto) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommand> {
  constructor(
    @InjectModel(Comment.name) private readonly CommentModel: CommentModelType,
    @Inject() private readonly commentsRepository: CommentsRepository,
    @Inject() private readonly usersService: UsersService,
    @Inject() private readonly postsRepository: PostsRepository,
  ) {}
  async execute(command: CreateCommentCommand) {
    const { dto } = command;
    await this.postsRepository.getByIdOrFail(dto.postId);
    const user = await this.usersService.getByIdOrFail(dto.userId);
    const commentDto: CreateCommentDomainDto = Object.assign(
      { userLogin: user.login },
      dto,
    );
    const comment = this.CommentModel.createInstance(commentDto);
    await this.commentsRepository.save(comment);
    return comment.id;
  }
}
