import { Inject, Injectable } from '@nestjs/common';
import { UsersService } from '../../user-account/application/users.service';
import { UserViewDto } from '../api/view-dto/user-view.dto';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(@Inject() private readonly usersService: UsersService) {}

  async me(userId: string) {
    const user = await this.usersService.getByIdOrFailRaw(userId);
    return UserViewDto.mapToView(user);
  }

  getLoginInfo(req: Request) {
    const ip = req.ip ?? '::';
    const agent = req.headers['user-agent'] ?? 'default-client';
    return { ip, agent };
  }
}
