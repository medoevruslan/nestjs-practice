import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  GetPostsQueryParams,
  PostsSortBy,
} from '../../api/input-dto/get-posts.query-params.input-dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  MappedPaginatedViewType,
  PaginatedViewDto,
} from '../../../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from '../../api/view-dto/PostViewDto';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostMapper, PostSqlRaw } from '../mapper/post.mapper';
import { Like, LikeModel, LikeStatus } from '../../../likes/domain/like.entity';
import { ExtendedLikesViewDto } from '../../../likes/api/view-dto/likes-view.dto';

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
    @InjectModel(Like.name) private readonly likeModel: LikeModel,
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
    const result = new Map<string, ExtendedLikesViewDto>(
      postIds.map((postId) => [
        postId,
        {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: LikeStatus.None,
          newestLikes: [],
        },
      ]),
    );

    if (!postIds.length) {
      return result;
    }

    const likes = await this.likeModel
      .find({ parentId: { $in: postIds }, parentType: 'Post' })
      .sort({ createdAt: -1 })
      .exec();

    for (const like of likes) {
      const info = result.get(like.parentId);

      if (!info) {
        continue;
      }

      if (like.status === LikeStatus.Like) {
        info.likesCount += 1;

        if (info.newestLikes.length < 3) {
          info.newestLikes.push({
            addedAt: like.createdAt.toISOString(),
            userId: like.userId,
            login: like.login,
          });
        }
      } else if (like.status === LikeStatus.Dislike) {
        info.dislikesCount += 1;
      }

      if (like.userId === userId) {
        info.myStatus = like.status;
      }
    }

    return result;
  }
}
