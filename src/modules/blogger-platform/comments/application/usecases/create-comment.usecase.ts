import { CreateCommentDto } from '../../dto/create-comment.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateCommentDomainDto } from '../../domain/dto/create-comment.domain-dto';
import { UsersService } from 'src/modules/user-account/application/users.service';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentSqlRaw } from '../../infrastructure/mapper/comment.mapper';

export class CreateCommentCommand {
  constructor(readonly dto: CreateCommentDto) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommand> {
  constructor(
    @Inject() private readonly usersService: UsersService,
    @Inject() private readonly postsRepository: PostsRepository,
    @InjectDataSource() private readonly dataSrc: DataSource,
  ) {}
  async execute(command: CreateCommentCommand) {
    const { dto } = command;
    await this.postsRepository.getByIdOrFail(dto.postId);
    const user = await this.usersService.getByIdOrFail(dto.userId);
    const commentDto: CreateCommentDomainDto = Object.assign(
      { userLogin: user.login },
      dto,
    );

    const [created] = await this.dataSrc.query<CommentSqlRaw[]>(
      `INSERT INTO comments (content, user_id, post_id, user_login) VALUES ($1, $2, $3, $4) RETURNING id::TEXT as id`,
      [
        commentDto.content,
        commentDto.userId,
        commentDto.postId,
        commentDto.userLogin,
      ],
    );
    return created.id;
  }
}
