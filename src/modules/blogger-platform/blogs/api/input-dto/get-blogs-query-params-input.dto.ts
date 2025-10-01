import { BaseQueryParams } from '../../../../../core/dto/base.query-params.input-dto';

export class GetBlogsQueryParams extends BaseQueryParams {
  sortBy = BlogsSortBy.CreatedAt;
  searchNameTerm: string | null = null;
}

export enum BlogsSortBy {
  CreatedAt = 'createdAt',
  Login = 'login',
  Email = 'email',
}
