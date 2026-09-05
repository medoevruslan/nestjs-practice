import { User } from '../../domain/user.entity';

export class UserViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: string;

  static mapToView(dto: User): UserViewDto {
    return {
      id: dto.id ?? dto._id.toString(),
      login: dto.login,
      email: dto.email,
      createdAt: dto.createdAt.toISOString(),
    };
  }
}
