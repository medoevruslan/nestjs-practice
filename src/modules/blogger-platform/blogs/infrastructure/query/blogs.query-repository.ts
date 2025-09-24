import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, BlogModelType } from '../../domain/blog.entity';
import { BlogViewDto } from '../../api/view-dto/blog.view-dto';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params-input.dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}
  async getAll(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const { pageNumber, pageSize, searchNameTerm, sortDirection, sortBy } =
      query;

    const skip = query.calculateSkip();

    const filter = searchNameTerm
      ? { name: { $regex: searchNameTerm, $options: 'i' } }
      : {};

    const [totalCount, blogs]: [number, BlogDocument[]] = await Promise.all([
      this.BlogModel.countDocuments(filter), // Fetch total count
      this.BlogModel.find(filter)
        .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(pageSize),
    ]);

    const data = {
      totalCount,
      items: blogs.map(BlogViewDto.mapToView),
      page: pageNumber,
      size: pageSize,
    } satisfies Parameters<typeof PaginatedViewDto.mapToView<BlogViewDto[]>>[0];

    return PaginatedViewDto.mapToView<BlogViewDto[]>(data);
  }

  async getByIdOrNotFoundFail(id: string) {
    const found = await this.BlogModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!found) {
      throw new NotFoundException('Blog not found');
    }

    return BlogViewDto.mapToView(found);
  }
}
