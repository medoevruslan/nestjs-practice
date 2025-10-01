import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../domain/post.entity';
import { GetPostsQueryParams } from '../api/input-dto/get-posts.query-params.input-dto';
import { FilterQuery } from 'mongoose';
import {
  MappedPaginatedViewType,
  PaginatedViewDto,
} from '../../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from '../api/view-dto/PostViewDto';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async getAll(
    query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const { pageSize, pageNumber, sortBy, sortDirection } = query;

    const filter: FilterQuery<Post> = { deletedAt: null };

    const [totalCount, posts] = await Promise.all([
      this.PostModel.countDocuments(filter),
      this.PostModel.find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip(query.calculateSkip())
        .limit(pageSize),
    ]);

    const data = {
      totalCount,
      items: posts.map(PostViewDto.mapToView),
      page: pageNumber,
      size: pageSize,
    } satisfies MappedPaginatedViewType<PostViewDto[]>;

    return PaginatedViewDto.mapToView(data);
  }

  async save(post: PostDocument) {
    await post.save();
  }

  async getByIdOrFail(id: string) {
    const found = await this.PostModel.findOne({ _id: id });

    if (!found) {
      throw new NotFoundException();
    }

    return found;
  }
}
