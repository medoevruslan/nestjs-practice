import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../../domain/user.entity';
import { UserViewDto } from '../../api/view-dto/UserViewDto';
import { FilterQuery } from 'mongoose';
import {
  MappedPaginatedViewType,
  PaginatedViewDto,
} from '../../../../core/dto/base.paginated.view-dto';
import { GetUsersQueryParams } from '../../api/input-dto/get-users.query-params.input-dto';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

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
        .limit(pageSize)
        .lean(),
    ]);

    const data = {
      totalCount,
      page: pageNumber,
      size: pageSize,
      items: users.map(UserViewDto.mapToView),
    } satisfies MappedPaginatedViewType<UserViewDto[]>;

    return PaginatedViewDto.mapToView<UserViewDto[]>(data);
  }
  async getByIdOrFail(id: string): Promise<UserViewDto> {
    const found = await this.UserModel.findOne({ _id: id, deletedAt: null });

    if (!found) {
      throw new NotFoundException();
    }

    return UserViewDto.mapToView(found);
  }
}
