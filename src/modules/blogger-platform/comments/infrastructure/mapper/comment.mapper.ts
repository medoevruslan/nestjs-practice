import { Nullable, SqlDate } from 'src/shared/common.types';
import { Comment, CommentWithLikesInfo } from '../../domain/comment.entity';
import { LikeStatus } from 'src/modules/blogger-platform/likes/domain/like.entity';

export type CommentSqlRaw = {
  id: string | number | bigint;
  content: string;
  user_id: string;
  user_login: string;
  post_id: string;
  created_at: SqlDate;
  updated_at: SqlDate;
  deleted_at: Nullable<SqlDate>;
};

export type CommentWithLikesInfoSqlRaw = CommentSqlRaw & {
  likes_count: number;
  dislikes_count: number;
  user_like_status: string;
};

export class CommentsMapper {
  static fromSqlRaw(raw: CommentSqlRaw): Comment {
    const comment = new Comment();

    comment.relationalId = String(raw.id);
    comment.content = raw.content;
    comment.postId = raw.post_id;
    comment.userId = raw.user_id;
    comment.userLogin = raw.user_login;
    comment.createdAt = this.toDate(raw.created_at);
    comment.updatedAt = this.toDate(raw.updated_at);
    comment.deletedAt = this.toDateNullable(raw.deleted_at);

    return comment;
  }

  static fromSqlRawWithLikes(
    raw: CommentWithLikesInfoSqlRaw,
  ): CommentWithLikesInfo {
    const comment = this.fromSqlRaw(raw);

    return {
      ...comment,
      id: comment.relationalId,
      likesCount: Number(raw.likes_count),
      dislikesCount: Number(raw.dislikes_count),
      userLikeStatus: { status: this.toLikeStatus(raw.user_like_status) },
    };
  }

  static toLikeStatus(status: string) {
    switch (status) {
      case LikeStatus.Like:
        return LikeStatus.Like;
      case LikeStatus.Dislike:
        return LikeStatus.Dislike;
      default:
        return LikeStatus.None;
    }
  }

  static toDate(date: SqlDate) {
    return date instanceof Date ? date : new Date(date);
  }

  static toDateNullable(date: Nullable<SqlDate>) {
    return date === null ? null : this.toDate(date);
  }
}
