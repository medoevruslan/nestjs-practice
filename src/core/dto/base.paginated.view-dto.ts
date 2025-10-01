export abstract class PaginatedViewDto<T> {
  abstract items: T;
  pagesCount: number;
  pageSize: number;
  page: number;
  totalCount: number;

  public static mapToView<T>(data: {
    totalCount: number;
    size: number;
    page: number;
    items: T;
  }): PaginatedViewDto<T> {
    return {
      totalCount: data.totalCount,
      pagesCount: Math.ceil(data.totalCount / data.size),
      page: data.page,
      pageSize: data.size,
      items: data.items,
    };
  }
}

export type MappedPaginatedViewType<T> = Parameters<
  typeof PaginatedViewDto.mapToView<T>
>[0];
