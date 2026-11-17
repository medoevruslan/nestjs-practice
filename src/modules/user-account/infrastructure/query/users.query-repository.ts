import { Injectable } from '@nestjs/common';
import { UserViewDto } from '../../api/view-dto/UserViewDto';
import {
  MappedPaginatedViewType,
  PaginatedViewDto,
} from '../../../../core/dto/base.paginated.view-dto';
import {
  GetUsersQueryParams,
  UsersSortBy,
} from '../../api/input-dto/get-users.query-params.input-dto';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, ObjectLiteral, Repository } from 'typeorm';
import { User } from '../../domain/user.entity';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectRepository(User) private readonly usersRepoOrm: Repository<User>,
  ) {}

  async getAll(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const {
      sortBy,
      sortDirection,
      pageSize,
      pageNumber,
      searchEmailTerm,
      searchLoginTerm,
    } = query;

    const searchTerms: ObjectLiteral[] = [];

    if (searchLoginTerm?.trim()) {
      searchTerms.push({ login: ILike(`%${searchLoginTerm}%`) });
    }

    if (searchEmailTerm?.trim()) {
      searchTerms.push({ email: ILike(`%${searchEmailTerm}%`) });
    }

    const usersQueryBuilder = this.usersRepoOrm.createQueryBuilder('u');

    usersQueryBuilder
      .where(searchTerms)
      .orderBy(`u.${sortBy ?? UsersSortBy.CreatedAt}`, sortDirection)
      .addSelect('COUNT(*) OVER()', 'total_count')
      .limit(pageSize)
      .offset(query.calculateSkip());

    const { entities: usrs, raw } = await usersQueryBuilder.getRawAndEntities();

    const totalCount = Number(raw[0]?.total_count ?? 0);

    const data = {
      totalCount,
      page: pageNumber,
      size: pageSize,
      items: usrs.map(UserViewDto.mapToView),
    } satisfies MappedPaginatedViewType<UserViewDto[]>;

    return PaginatedViewDto.mapToView<UserViewDto[]>(data);
  }

  async getByIdOrFail(id: string): Promise<UserViewDto> {
    const found = await this.usersRepoOrm.findOneBy({ id });

    if (!found) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return UserViewDto.mapToView(found);
  }
}
