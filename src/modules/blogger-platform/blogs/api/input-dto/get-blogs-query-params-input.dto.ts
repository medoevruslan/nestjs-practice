import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';
import { BlogViewDto } from '../view-dto/blog.view-dto';

export class BlogQueryParamsInputDto extends BaseQueryParams {
  sortBy: keyof BlogViewDto = 'createdAt';
}
