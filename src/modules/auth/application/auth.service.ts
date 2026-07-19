import { Inject, Injectable } from '@nestjs/common';
import { UsersService } from '../../user-account/application/users.service';
import { UserViewDto } from '../api/view-dto/user-view.dto';

@Injectable()
export class AuthService {
  constructor(@Inject() private readonly usersService: UsersService) {}

  async me(userId: string) {
    const user = await this.usersService.getByIdOrFail(userId);
    return UserViewDto.mapToView(user);
  }
}
