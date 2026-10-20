import { Injectable } from '@nestjs/common';
import { Comment } from '../domain/comment.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { CommentsMapper, CommentSqlRaw } from './mapper/comment.mapper';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsRepository {
  constructor(@InjectDataSource() private readonly dataSrc: DataSource) {}

  async update(updateData: Comment) {
    const [, affectedCount] = await this.dataSrc.query<
      [{ id: string }[], number]
    >(`UPDATE comments SET updated_at = NOW(), content = $1 WHERE id = $2`, [
      updateData.content,
      updateData.id,
    ]);

    return affectedCount === 1;
  }

  async delete(id: string) {
    const [, affectedCount] = await this.dataSrc.query<
      [{ id: string }[], number]
    >(
      `UPDATE comments SET updated_at = NOW(), deleted_at = NOW() WHERE id = $1`,
      [id],
    );

    return affectedCount === 1;
  }

  async getByIdOrFail(id: string): Promise<Comment> {
    const [found] = await this.dataSrc.query<CommentSqlRaw[]>(
      `SELECT * FROM comments WHERE id = $1 AND deleted_at IS NULL;`,
      [id],
    );

    if (!found) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
      });
    }

    return CommentsMapper.fromSqlRaw(found);
  }
}
