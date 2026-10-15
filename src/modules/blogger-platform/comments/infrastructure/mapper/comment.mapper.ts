import { Nullable, SqlDate } from 'src/shared/common.types';
import { Comment } from '../../domain/comment.entity';

export type CommentSqlRaw = {
  id: string | number | bigint;
  content: string;
  user_id: string;
  post_id: string;
  created_at: SqlDate;
  updated_at: SqlDate;
  deleted_at: Nullable<SqlDate>;
};

export class CommentsMapper {
  static fromSqlRaw(raw: CommentSqlRaw): Comment {
    const comment = new Comment();

    comment.relationalId = String(raw.id);
    comment.content = raw.content;
    comment.postId = raw.post_id;
    comment.userId = raw.user_id;
    comment.createdAt = this.toDate(raw.created_at);
    comment.updatedAt = this.toDate(raw.updated_at);
    comment.deletedAt = this.toDateNullable(raw.deleted_at);

    return comment;
  }
  static toDate(date: SqlDate) {
    return date instanceof Date ? date : new Date(date);
  }

  static toDateNullable(date: Nullable<SqlDate>) {
    return date === null ? null : this.toDate(date);
  }
}
