import { Nullable, SqlDate } from 'src/shared/common.types';
import { Post } from '../../domain/post.entity';

export type PostSqlRaw = {
  id: string | bigint | number;
  title: string;
  short_description: string;
  content: string;
  blog_name: string;
  created_at: SqlDate;
  updated_at: SqlDate;
  deleted_at: Nullable<SqlDate>;
  blog_id: string | bigint | number;
};

export class PostMapper {
  static fromSqlRaw(raw: PostSqlRaw): Post {
    const post = new Post();

    post.id = raw.id.toString();
    post.blogId = raw.blog_id.toString();
    post.blogName = raw.blog_name;
    post.content = raw.content;
    post.shortDescription = raw.short_description;
    post.title = raw.title;
    post.createdAt = this.toDate(raw.created_at);
    post.updatedAt = this.toDate(raw.updated_at);
    post.deletedAt = this.toDateNullable(raw.deleted_at);

    return post;
  }
  static toDate(date: SqlDate) {
    return date instanceof Date ? date : new Date(date);
  }
  static toDateNullable(date: Nullable<SqlDate>) {
    return date === null ? null : this.toDate(date);
  }
}
