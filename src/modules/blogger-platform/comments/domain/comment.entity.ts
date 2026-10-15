import { LikeStatus } from '../../likes/domain/like.entity';
import { Nullable } from 'src/shared/common.types';
export class Comment {
  relationalId: string;

  content: string;

  userId: string;

  userLogin: string;

  postId: string;

  createdAt: Date;
  updatedAt: Date;

  get id() {
    return this.relationalId;
  }

  deletedAt: Nullable<Date> = null;
}

export type CommentWithLikesInfo = Comment & {
  likesCount: number;
  dislikesCount: number;
  userLikeStatus: Nullable<{ status: LikeStatus }>;
};
