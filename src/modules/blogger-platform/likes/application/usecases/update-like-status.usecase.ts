import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { LikeStatus } from '../../domain/like.entity';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { CommentsRepository } from '../../../comments/infrastructure/comments.repository';
import { UsersService } from '../../../../user-account/application/users.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export type LikeParentType = 'Post' | 'Comment';

export class UpdateLikeStatusCommand {
  constructor(
    public readonly parentId: string,
    public readonly parentType: LikeParentType,
    public readonly userId: string,
    public readonly status: LikeStatus,
  ) {}
}

@CommandHandler(UpdateLikeStatusCommand)
export class UpdateLikeStatusUseCase implements ICommandHandler<UpdateLikeStatusCommand> {
  constructor(
    @Inject() private readonly postsRepository: PostsRepository,
    @Inject() private readonly commentsRepository: CommentsRepository,
    @Inject() private readonly usersService: UsersService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async execute(command: UpdateLikeStatusCommand): Promise<void> {
    await this.ensureParentExists(command.parentId, command.parentType);

    if (command.status === LikeStatus.None) {
      await this.dataSource.query(
        `DELETE FROM likes
         WHERE parent_id = $1
           AND parent_type = $2
           AND user_id = $3`,
        [command.parentId, command.parentType, command.userId],
      );
      return;
    }

    const user = await this.usersService.getByIdOrFail(command.userId);

    await this.dataSource.query(
      `INSERT INTO likes (parent_id, parent_type, user_id, login, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (parent_id, parent_type, user_id)
       DO UPDATE SET
         status = EXCLUDED.status,
         login = EXCLUDED.login,
         updated_at = NOW()`,
      [
        command.parentId,
        command.parentType,
        command.userId,
        user.login,
        command.status,
      ],
    );
  }

  private async ensureParentExists(
    parentId: string,
    parentType: LikeParentType,
  ): Promise<void> {
    if (parentType === 'Post') {
      await this.postsRepository.getByIdOrFail(parentId);
      return;
    }

    await this.commentsRepository.getByIdOrFail(parentId);
  }
}
