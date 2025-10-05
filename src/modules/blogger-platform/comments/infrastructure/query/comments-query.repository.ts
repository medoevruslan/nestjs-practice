import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentModelType } from '../../domain/comment.entity';
import { CommentViewDto } from '../../api/view-dto/comment-view-dto';

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
        { path: 'userLikeStatus', match: { userId } },
      ])
      .exec();

    if (!found) {
      throw new NotFoundException();
    }

    return CommentViewDto.mapToView(found);
  }
}
