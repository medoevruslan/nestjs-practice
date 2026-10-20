import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  GetPostsQueryParams,
  PostsSortBy,
} from '../../api/input-dto/get-posts.query-params.input-dto';
import {
  MappedPaginatedViewType,
  PaginatedViewDto,
} from '../../../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from '../../api/view-dto/PostViewDto';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostMapper, PostSqlRaw } from '../mapper/post.mapper';
import { ExtendedLikesViewDto } from '../../../likes/api/view-dto/likes-view.dto';
import { LikeStatus } from '../../../likes/domain/like.entity';

type PostLikeSqlRaw = {
  parent_id: string;
  user_id: string;
  login: string;
  status: LikeStatus;
  created_at: Date | string;
};

@Injectable()
export class PostsQueryRepository {
  private readonly sortColumns = new Map<string, string>([
    [PostsSortBy.Title, '"title" COLLATE "C"'],
    [PostsSortBy.BlogName, '"blog_name" COLLATE "C"'],
    [PostsSortBy.CreatedAt, 'created_at'],
  ]);

  constructor(
    @Inject() private readonly blogsRepository: BlogsRepository,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async getAll(
    query: GetPostsQueryParams,
    userId: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const { sortBy, sortDirection, pageNumber, pageSize } = query;

    const whereClause = ['deleted_at IS NULL'].join(' AND ');

    const sort =
      this.sortColumns.get(sortBy) ??
      this.sortColumns.get(PostsSortBy.CreatedAt);

    const [[countResult], posts] = await Promise.all([
      this.dataSource.query<[{ count: number }]>(
        `SELECT COUNT(*) FROM posts WHERE ${whereClause}`,
      ),
      this.dataSource.query<PostSqlRaw[]>(
        `SELECT * FROM posts WHERE ${whereClause} ORDER BY ${sort} ${sortDirection}, id ${sortDirection} LIMIT $1 OFFSET $2`,
        [pageSize, query.calculateSkip()],
      ),
    ]);

    const mappedPosts = posts.map(PostMapper.fromSqlRaw, PostMapper);
    const likesInfo = await this.getLikesInfo(
      mappedPosts.map((post) => post.id),
      userId,
    );

    const data = {
      size: pageSize,
      page: pageNumber,
      totalCount: Number(countResult.count),
      items: mappedPosts.map((post) =>
        PostViewDto.mapToView(post, likesInfo.get(post.id)),
      ),
    } satisfies MappedPaginatedViewType<PostViewDto[]>;

    return PaginatedViewDto.mapToView(data);
  }

  async getPostByIdOrFail(id: string, userId: string) {
    const [found] = await this.dataSource.query<PostSqlRaw[]>(
      `SELECT * FROM posts WHERE id=$1 AND deleted_at IS NULL`,
      [id],
    );

    if (!found) {
      throw new NotFoundException();
    }

    const post = PostMapper.fromSqlRaw(found);
    const likesInfo = await this.getLikesInfo([post.id], userId);

    return PostViewDto.mapToView(post, likesInfo.get(post.id));
  }

  async getPostByBlogIdOrFail(
    blogId: string,
    userId: string,
    query: GetPostsQueryParams,
  ) {
    const { sortBy, sortDirection, pageNumber, pageSize } = query;

    await this.blogsRepository.getByIdOrNotFoundFail(blogId);

    const searchParams: string[] = [blogId];

    const whereClause = [
      'deleted_at IS NULL',
      `blog_id=$${searchParams.length}`,
    ].join(' AND ');

    const sort =
      this.sortColumns.get(sortBy) ??
      this.sortColumns.get(PostsSortBy.CreatedAt);

    const [[countResult], posts] = await Promise.all([
      this.dataSource.query(
        `SELECT COUNT(*) FROM posts WHERE ${whereClause}`,
        searchParams,
      ),
      this.dataSource.query<PostSqlRaw[]>(
        `SELECT * FROM posts WHERE ${whereClause} ORDER BY ${sort} ${sortDirection}, id ${sortDirection} LIMIT $${searchParams.length + 1} OFFSET $${searchParams.length + 2}`,
        [...searchParams, pageSize, query.calculateSkip()],
      ),
    ]);

    const mappedPosts = posts.map(PostMapper.fromSqlRaw, PostMapper);
    const likesInfo = await this.getLikesInfo(
      mappedPosts.map((post) => post.id),
      userId,
    );

    const data = {
      size: pageSize,
      page: pageNumber,
      totalCount: Number(countResult.count),
      items: mappedPosts.map((post) =>
        PostViewDto.mapToView(post, likesInfo.get(post.id)),
      ),
    } satisfies MappedPaginatedViewType<PostViewDto[]>;

    return PaginatedViewDto.mapToView(data);
  }

  private async getLikesInfo(
    postIds: string[],
    userId: string,
  ): Promise<Map<string, ExtendedLikesViewDto>> {
    const result = new Map<string, ExtendedLikesViewDto>();

    for (const postId of postIds) {
      result.set(postId, {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: [],
      });
    }

    if (postIds.length === 0) {
      return result;
    }

    const likes = await this.dataSource.query<PostLikeSqlRaw[]>(
      `SELECT
         parent_id::text AS parent_id,
         user_id::text AS user_id,
         login,
         status,
         created_at
       FROM likes
       WHERE parent_type = 'Post'
         AND parent_id = ANY($1::bigint[])
       ORDER BY created_at DESC, id DESC`,
      [postIds],
    );

    for (const like of likes) {
      const info = result.get(like.parent_id);

      if (!info) {
        continue;
      }

      if (like.status === LikeStatus.Like) {
        info.likesCount += 1;

        if (info.newestLikes.length < 3) {
          info.newestLikes.push({
            addedAt: new Date(like.created_at).toISOString(),
            userId: like.user_id,
            login: like.login,
          });
        }
      } else if (like.status === LikeStatus.Dislike) {
        info.dislikesCount += 1;
      }

      if (like.user_id === userId) {
        info.myStatus = like.status;
      }
    }

    return result;
  }
}
