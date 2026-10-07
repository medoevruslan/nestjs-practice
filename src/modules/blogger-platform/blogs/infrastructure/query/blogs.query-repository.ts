import { Injectable } from '@nestjs/common';
import { BlogViewDto } from '../../api/view-dto/blog.view-dto';
import {
  BlogsSortBy,
  GetBlogsQueryParams,
} from '../../api/input-dto/get-blogs-query-params-input.dto';
import {
  MappedPaginatedViewType,
  PaginatedViewDto,
} from '../../../../../core/dto/base.paginated.view-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SortDirection } from 'src/core/dto/base.query-params.input-dto';
import { BlogMapper, BlogSqlRaw } from '../mapper/blog.mapper';

@Injectable()
export class BlogsQueryRepository {
  private readonly sortColumns = new Map<string, string>([
    [BlogsSortBy.CreatedAt, '"created_at"'],
    [BlogsSortBy.Name, '"name" COLLATE "C"'],
    [BlogsSortBy.Description, '"description" COLLATE "C"'],
  ]);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}
  async getAll(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const { pageNumber, pageSize, searchNameTerm, sortDirection, sortBy } =
      query;

    const sortColumn =
      this.sortColumns.get(sortBy) ??
      this.sortColumns.get(BlogsSortBy.CreatedAt)!;

    const direction = sortDirection === SortDirection.Asc ? 'ASC' : 'DESC';

    const skip = query.calculateSkip();

    const searchConditions: string[] = [];
    const filterParams: string[] = [];

    if (searchNameTerm) {
      filterParams.push(searchNameTerm);
      searchConditions.push(
        `POSITION(LOWER($${filterParams.length}) IN LOWER(name)) > 0`,
      );
    }

    const whereClause = [
      `deleted_at IS NULL`,
      searchConditions.length ? `(${searchConditions.join(' OR ')})` : null,
    ]
      .filter(Boolean)
      .join(' AND ');

    const pageSizeParamOrder = filterParams.length + 1;
    const offsetParamOrder = filterParams.length + 2;

    const [[countResult], blogs] = await Promise.all([
      this.dataSource.query(
        `SELECT COUNT(*)::int AS count FROM blogs WHERE ${whereClause}`,
        filterParams,
      ),
      this.dataSource.query<BlogSqlRaw[]>(
        `SELECT * FROM blogs WHERE ${whereClause} ORDER BY ${sortColumn} ${direction}, id ${direction} LIMIT $${pageSizeParamOrder} OFFSET $${offsetParamOrder}`,
        [...filterParams, pageSize, skip],
      ),
    ]);

    const data = {
      totalCount: countResult.count,
      items: blogs
        .map(BlogMapper.fromRawSql, BlogMapper)
        .map(BlogViewDto.mapToView),
      page: pageNumber,
      size: pageSize,
    } satisfies MappedPaginatedViewType<BlogViewDto[]>;

    return PaginatedViewDto.mapToView<BlogViewDto[]>(data);
  }

  async getByIdOrNotFoundFail(id: string) {
    const [found] = await this.dataSource.query<BlogSqlRaw[]>(
      `SELECT * FROM blogs WHERE id=$1 AND deleted_at IS NULL`,
      [id],
    );

    if (!found) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
    }

    return BlogViewDto.mapToView(BlogMapper.fromRawSql(found));
  }
}
