import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Comment, CommentModelType } from '../../domain/comment.entity';
import { CommentViewDto } from '../../api/view-dto/comment-view-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}

  async getCommentByIdOrFail(id: string, userId: string) {
    const found = await this.CommentModel.findOne({
      _id: id,
      deletedAt: null,
    })
      .populate([
        { path: 'likesCount' },
        { path: 'dislikesCount' },
        this.userLikeStatusPopulate(userId),
      ])
      .exec();

    if (!found) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
      });
    }

    return CommentViewDto.mapToView(found);
  }

  async getCommentsByPostIdOrFail(postId: string, userId: string) {
    const found = await this.CommentModel.find({
      postId,
      deletedAt: null,
    })
      .populate([
        { path: 'likesCount' },
        { path: 'dislikesCount' },
        this.userLikeStatusPopulate(userId),
      ])
      .exec();

    if (!found.length) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
      });
    }

    return found.map(CommentViewDto.mapToView);
  }

  private userLikeStatusPopulate(userId: string) {
    return {
      path: 'userLikeStatus',
      match: {
        userId: Types.ObjectId.isValid(userId)
          ? new Types.ObjectId(userId)
          : new Types.ObjectId(),
      },
    };
  }
}
