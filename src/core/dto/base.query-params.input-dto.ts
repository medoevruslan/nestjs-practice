import { Type } from 'class-transformer';

export class BaseQueryParams {
  @Type(() => Number)
  pageNumber = 1;

  @Type(() => Number)
  pageSize = 10;
  sortDirection: SortDirection = SortDirection.Desc;

  public calculateSkip() {
    return (this.pageNumber - 1) * this.pageSize;
  }
}

export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc',
}
