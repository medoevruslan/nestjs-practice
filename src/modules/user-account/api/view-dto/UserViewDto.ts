import { UserDocument } from '../../domain/user.entity';

export class UserViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: string;

  static mapToView(dto: UserDocument): UserViewDto {
    return {
      id: dto.id ?? dto._id.toString(),
      login: dto.login,
      email: dto.email,
      createdAt: dto.createdAt.toISOString(),
    };
  }
}
