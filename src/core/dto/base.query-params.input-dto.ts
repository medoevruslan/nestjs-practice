import { Transform, Type } from 'class-transformer';
import { IsEnum } from 'class-validator';

export enum SortDirection {
  Asc = 'ASC',
  Desc = 'DESC',
}
export class BaseQueryParams {
  @Type(() => Number)
  pageNumber = 1;

  @Type(() => Number)
  pageSize = 10;

  @IsEnum(SortDirection)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  sortDirection: SortDirection = SortDirection.Desc;

  public calculateSkip() {
    return (this.pageNumber - 1) * this.pageSize;
  }
}
