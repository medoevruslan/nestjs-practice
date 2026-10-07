import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Blog } from '../domain/blog.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { BlogMapper, BlogSqlRaw } from './mapper/blog.mapper';

@Injectable()
export class BlogsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async save(blog: Blog) {
    await this.dataSource.query(
      `UPDATE blogs
       SET name = $1,
           description = $2,
           website_url = $3,
           deleted_at = $4,
           updated_at = NOW()
       WHERE id = $5`,
      [blog.name, blog.description, blog.websiteUrl, blog.deletedAt, blog.id],
    );
  }

  async getByIdOrNotFoundFail(id: string) {
    const [found] = await this.dataSource.query<BlogSqlRaw[]>(
      `SELECT * FROM blogs WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );

    if (!found) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
    }

    return BlogMapper.fromRawSql(found);
  }
}
