import { Nullable, SqlDate } from 'src/shared/common.types';
import { Blog } from '../../domain/blog.entity';

export type BlogSqlRaw = {
  id: string | number | bigint;
  name: string;
  description: string;
  website_url: string;
  is_membership: boolean;
  created_at: SqlDate;
  updated_at: SqlDate;
  deleted_at: Nullable<SqlDate>;
};

export class BlogMapper {
  static fromRawSql(raw: BlogSqlRaw): Blog {
    const blog = new Blog();

    blog.relationalId = String(raw.id);
    blog.name = raw.name;
    blog.description = raw.description;
    blog.websiteUrl = raw.website_url;
    blog.createdAt = this.toDate(raw.created_at);
    blog.updatedAt = this.toDate(raw.updated_at);
    blog.deletedAt = this.toNullableDate(raw.deleted_at);
    blog.isMembership = raw.is_membership;

    return blog;
  }

  private static toDate(dateLike: SqlDate) {
    return dateLike instanceof Date ? dateLike : new Date(dateLike);
  }

  private static toNullableDate(dateLike: Nullable<SqlDate>) {
    return dateLike === null ? null : this.toDate(dateLike);
  }
}
