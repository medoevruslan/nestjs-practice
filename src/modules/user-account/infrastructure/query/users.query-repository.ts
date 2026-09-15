import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../../domain/user.entity';
import { UserViewDto } from '../../api/view-dto/UserViewDto';
import { FilterQuery } from 'mongoose';
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
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserMapper, UserSqlRow } from '../mappers/user.mapper';
import { SortDirection } from 'src/core/dto/base.query-params.input-dto';

@Injectable()
export class UsersQueryRepository {
  private readonly sortColumns = new Map<string, string>([
    [UsersSortBy.CreatedAt, '"created_at"'],
    [UsersSortBy.Email, '"email" COLLATE "C"'],
    [UsersSortBy.Login, '"login" COLLATE "C"'],
  ]);

  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    @InjectDataSource() private readonly dataSource: DataSource,
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

    const filter: FilterQuery<User> = { deletedAt: null };

    if (searchLoginTerm) {
      filter.$or = filter.$or ?? [];
      filter.$or.push({ login: { $regex: searchLoginTerm, $options: 'i' } });
    }

    if (searchEmailTerm) {
      filter.$or = filter.$or ?? [];
      filter.$or.push({ email: { $regex: searchEmailTerm, $options: 'i' } });
    }

    const [totalCount, users] = await Promise.all([
      this.UserModel.countDocuments(filter),
      this.UserModel.find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip(query.calculateSkip())
        .limit(pageSize),
    ]);

    const data = {
      totalCount,
      page: pageNumber,
      size: pageSize,
      items: users.map(UserViewDto.mapToView.bind),
    } satisfies MappedPaginatedViewType<UserViewDto[]>;

    return PaginatedViewDto.mapToView<UserViewDto[]>(data);
  }

  async getAllRaw(
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

    const sortColumn =
      this.sortColumns.get(sortBy) ??
      this.sortColumns.get(UsersSortBy.CreatedAt)!;
    const direction = sortDirection === SortDirection.Asc ? 'ASC' : 'DESC';

    const searchConditions: string[] = [];
    const filterParams: string[] = [];

    if (searchLoginTerm) {
      filterParams.push(searchLoginTerm);
      searchConditions.push(
        `POSITION(LOWER($${filterParams.length}) IN LOWER(login)) > 0`,
      );
    }

    if (searchEmailTerm) {
      filterParams.push(searchEmailTerm);
      searchConditions.push(
        `POSITION(LOWER($${filterParams.length}) IN LOWER(email)) > 0`,
      );
    }

    const whereClause = [
      'deleted_at IS NULL',
      searchConditions.length ? `(${searchConditions.join(' OR ')})` : null,
    ]
      .filter(Boolean)
      .join(' AND ');

    const pageSizeParam = filterParams.length + 1;
    const offsetParam = filterParams.length + 2;

    const [[totalCount], users] = await Promise.all([
      this.dataSource.query(
        `SELECT COUNT(*)::int AS count FROM users WHERE ${whereClause}`,
        filterParams,
      ),
      this.dataSource.query<UserSqlRow[]>(
        `
          SELECT *
          FROM users
          WHERE ${whereClause}
          ORDER BY ${sortColumn} ${direction}, id ${direction}
          LIMIT $${pageSizeParam} OFFSET $${offsetParam}
        `,
        [...filterParams, pageSize, query.calculateSkip()],
      ),
    ]);

    const items = users
      .map(UserMapper.fromSqlRow, UserMapper)
      .map(UserViewDto.mapToView);

    const data = {
      totalCount: totalCount.count,
      page: pageNumber,
      size: pageSize,
      items,
    } satisfies MappedPaginatedViewType<UserViewDto[]>;

    return PaginatedViewDto.mapToView<UserViewDto[]>(data);
  }

  async getByIdOrFail(id: string): Promise<UserViewDto> {
    const found = await this.UserModel.findOne({ _id: id, deletedAt: null });

    if (!found) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return UserViewDto.mapToView(found);
  }

  async getByIdOrFailRaw(id: string): Promise<UserViewDto> {
    const [found] = await this.dataSource.query<UserSqlRow[]>(
      `
        SELECT *
        FROM users
        WHERE id = $1 AND deleted_at IS NULL
      `,
      [id],
    );

    if (!found) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return UserViewDto.mapToView(UserMapper.fromSqlRow(found));
  }

  async getByLoginOrFail(login: string): Promise<UserViewDto> {
    const found = await this.UserModel.findOne({ login, deletedAt: null });

    if (!found) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return UserViewDto.mapToView(found);
  }
}
