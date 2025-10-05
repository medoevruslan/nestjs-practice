import { Injectable, NotFoundException } from '@nestjs/common';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts.query-params.input-dto';
import { FilterQuery } from 'mongoose';
import { Post, PostModelType } from '../../domain/post.entity';
import { InjectModel } from '@nestjs/mongoose';
import {
  MappedPaginatedViewType,
  PaginatedViewDto,
} from '../../../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from '../../api/view-dto/PostViewDto';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async getAll(
    query: GetPostsQueryParams,
    userId: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const { sortBy, sortDirection, pageNumber, pageSize } = query;

    const filter: FilterQuery<Post> = { deletedAt: null };

    const [totalCount, posts] = await Promise.all([
      this.PostModel.countDocuments(filter),
      this.PostModel.find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip(query.calculateSkip())
        .limit(pageSize)
        .populate([
          { path: 'likesCount' },
          { path: 'dislikesCount' },
          { path: 'newestLikes' },
          { path: 'userLikeStatus', match: { userId } },
        ])
        .exec(),
    ]);

    const data = {
      size: pageSize,
      page: pageNumber,
      totalCount,
      items: posts.map(PostViewDto.mapToView),
    } satisfies MappedPaginatedViewType<PostViewDto[]>;

    return PaginatedViewDto.mapToView(data);
  }

  async getPostByIdOrFail(id: string, userId: string) {
    const found = await this.PostModel.findOne({
      _id: id,
      deletedAt: null,
    })
      .populate([
        { path: 'likesCount' },
        { path: 'dislikesCount' },
        { path: 'newestLikes' },
        { path: 'userLikeStatus', match: { userId } },
      ])
      .exec();
    if (!found) {
      throw new NotFoundException();
    }

    return PostViewDto.mapToView(found);
  }
}
