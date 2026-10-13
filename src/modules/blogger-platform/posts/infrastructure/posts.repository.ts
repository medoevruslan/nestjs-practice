import { Injectable } from '@nestjs/common';
import { Post } from '../domain/post.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostMapper, PostSqlRaw } from './mapper/post.mapper';

@Injectable()
export class PostsRepository {
  constructor(@InjectDataSource() private readonly dataSrc: DataSource) {}

  async update(post: Post) {
    const [, affectedCount] = await this.dataSrc.query<
      [{ id: string }[], number]
    >(
      `UPDATE posts SET title = $1, short_description = $2, content = $3, blog_id = $4, blog_name = $5, updated_at = NOW(), deleted_at = $6 WHERE id=$7 RETURNING id::text AS id`,
      [
        post.title,
        post.shortDescription,
        post.content,
        post.blogId,
        post.blogName,
        post.deletedAt,
        post.id,
      ],
    );

    return affectedCount === 1;
  }

  async getByIdOrFail(id: string): Promise<Post> {
    const [found] = await this.dataSrc.query<PostSqlRaw[]>(
      `SELECT * FROM posts WHERE id=$1 AND deleted_at IS NULL`,
      [id],
    );

    if (!found) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }

    return PostMapper.fromSqlRaw(found);
  }
}
