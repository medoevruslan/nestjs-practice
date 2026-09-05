import { User } from '../../../user-account/domain/user.entity';

export class UserViewDto {
  email: string;
  login: string;
  userId: string;

  public static mapToView(user: User): UserViewDto {
    const dto = new UserViewDto();

    dto.userId = user.id;
    dto.login = user.login;
    dto.email = user.email;

    return dto;
  }
}
