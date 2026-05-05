import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, BlogModelType } from '../../domain/blog.entity';
import { BlogViewDto } from '../../api/view-dto/blog.view-dto';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params-input.dto';
import {
  MappedPaginatedViewType,
  PaginatedViewDto,
} from '../../../../../core/dto/base.paginated.view-dto';
import { FilterQuery } from 'mongoose';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}
  async getAll(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const { pageNumber, pageSize, searchNameTerm, sortDirection, sortBy } =
      query;

    const skip = query.calculateSkip();

    const filter: FilterQuery<Blog> = { deletedAt: null };

    if (searchNameTerm) {
      filter['name'] = { $regex: searchNameTerm, $options: 'i' };
    }

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
    } satisfies MappedPaginatedViewType<BlogViewDto[]>;

    return PaginatedViewDto.mapToView<BlogViewDto[]>(data);
  }

  async getByIdOrNotFoundFail(id: string) {
    const found = await this.BlogModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!found) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
    }

    return BlogViewDto.mapToView(found);
  }
}
