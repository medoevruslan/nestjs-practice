import { Inject, Injectable } from '@nestjs/common';
import { CommentViewDto } from '../../api/view-dto/comment-view-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { GetCommentsQueryParams } from '../../api/input-dto/get-comments.query-params.input-dto';
import {
  MappedPaginatedViewType,
  PaginatedViewDto,
} from '../../../../../core/dto/base.paginated.view-dto';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SortDirection } from '../../../../../core/dto/base.query-params.input-dto';
import {
  CommentsMapper,
  CommentWithLikesInfoSqlRaw,
} from '../mapper/comment.mapper';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectDataSource() private readonly dataSrc: DataSource,
    @Inject() private readonly postsRepository: PostsRepository,
  ) {}

  async getCommentByIdOrFail(id: string, userId: string) {
    const [found] = await this.dataSrc.query<CommentWithLikesInfoSqlRaw[]>(
      `SELECT c.*,
        COALESCE(ul.status, 'None') AS user_like_status,
        (COUNT(l.id) FILTER (WHERE l.status = 'Like'))::int AS likes_count,
        (COUNT(l.id) FILTER (WHERE l.status = 'Dislike'))::int AS dislikes_count
      FROM comments AS c LEFT JOIN likes AS l
        ON l.parent_id = c.id
        AND l.parent_type = 'Comment'
      LEFT JOIN likes AS ul
        ON ul.parent_id = c.id
        AND ul.parent_type = 'Comment'
        AND ul.user_id::text = $2
      WHERE c.id = $1 AND c.deleted_at IS NULL
        GROUP BY c.id, ul.status;`,
      [id, userId],
    );

    if (!found) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
      });
    }

    return CommentViewDto.mapToView(CommentsMapper.fromSqlRawWithLikes(found));
  }

  async getCommentsByPostIdOrFail(
    postId: string,
    userId: string,
    query: GetCommentsQueryParams,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    await this.postsRepository.getByIdOrFail(postId);

    const sortDirection = query.sortDirection;

    const [[countResult], comments] = await Promise.all([
      this.dataSrc.query<{ count: string }[]>(
        `SELECT COUNT(*) AS count from comments WHERE post_id = $1 AND deleted_at IS NULL`,
        [postId],
      ),
      this.dataSrc.query<CommentWithLikesInfoSqlRaw[]>(
        `SELECT c.*,
        COALESCE(ul.status, 'None') AS user_like_status,
        (COUNT(l.id) FILTER (WHERE l.status = 'Like'))::int AS likes_count,
        (COUNT(l.id) FILTER (WHERE l.status = 'Dislike'))::int AS dislikes_count
      FROM comments AS c LEFT JOIN likes AS l
        ON l.parent_id = c.id
        AND l.parent_type = 'Comment'
      LEFT JOIN likes AS ul
        ON ul.parent_id = c.id
        AND ul.parent_type = 'Comment'
        AND ul.user_id::text = $2
      WHERE c.post_id = $1 AND c.deleted_at IS NULL
      GROUP BY c.id, ul.status
      ORDER BY c.created_at ${sortDirection}, c.id ${sortDirection}
      LIMIT $3 OFFSET $4;`,
        [postId, userId, query.pageSize, query.calculateSkip()],
      ),
    ]);

    const data = {
      totalCount: Number(countResult.count),
      items: comments
        .map(CommentsMapper.fromSqlRawWithLikes, CommentsMapper)
        .map(CommentViewDto.mapToView),
      page: query.pageNumber,
      size: query.pageSize,
    } satisfies MappedPaginatedViewType<CommentViewDto[]>;

    return PaginatedViewDto.mapToView(data);
  }
}
