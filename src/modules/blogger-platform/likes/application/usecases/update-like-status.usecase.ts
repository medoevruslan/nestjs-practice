import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Like, LikeModel, LikeStatus } from '../../domain/like.entity';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { CommentsRepository } from '../../../comments/infrastructure/comments.repository';
import { UsersService } from '../../../../user-account/application/users.service';

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
    @InjectModel(Like.name) private readonly likeModel: LikeModel,
    @Inject() private readonly postsRepository: PostsRepository,
    @Inject() private readonly commentsRepository: CommentsRepository,
    @Inject() private readonly usersService: UsersService,
  ) {}

  async execute(command: UpdateLikeStatusCommand): Promise<void> {
    await this.ensureParentExists(command.parentId, command.parentType);

    const parentId = new Types.ObjectId(command.parentId);
    const userId = new Types.ObjectId(command.userId);

    const existingLike = await this.likeModel.findOne({
      parentId,
      parentType: command.parentType,
      userId,
    });

    if (command.status === LikeStatus.None) {
      if (existingLike) {
        await existingLike.deleteOne();
      }
      return;
    }

    if (existingLike) {
      existingLike.status = command.status;
      await existingLike.save();
      return;
    }

    const user = await this.usersService.getByIdOrFail(command.userId);
    await this.likeModel.create({
      parentId,
      parentType: command.parentType,
      userId,
      login: user.login,
      status: command.status,
    });
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
