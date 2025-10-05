import { BaseQueryParams } from '../../../../core/dto/base.query-params.input-dto';

export class GetUsersQueryParams extends BaseQueryParams {
  sortBy = UsersSortBy.CreatedAt;
  searchLoginTerm: string;
  searchEmailTerm: string;
}

export enum UsersSortBy {
  CreatedAt = 'createdAt',
  Email = 'email',
  Login = 'login',
}
