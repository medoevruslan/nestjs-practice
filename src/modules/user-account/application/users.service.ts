import { Inject, Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { User } from '../domain/user.entity';

@Injectable()
export class UsersService {
  constructor(@Inject() private usersRepository: UsersRepository) {}

  async save(user: User) {
    await this.usersRepository.update(user);
  }

  async getByIdOrFail(id: string) {
    return this.usersRepository.findByIdOrFail(id);
  }

  async getByLoginOrEmailNullable(loginOrEmail: string) {
    return this.usersRepository.findByEmailOrEmailOrNull(loginOrEmail);
  }

  async getByEmailOrNull(email: string) {
    return this.usersRepository.findByEmailOrNull(email);
  }

  async getByLoginNullable(login: string) {
    return this.usersRepository.findByLoginOrNull(login);
  }

  async getByPasswordRecoveryCodeOrNull(code: string) {
    return this.usersRepository.findByPasswordRecoveryCodeOrNull(code);
  }

  async getByEmailConfirmationCodeOrNull(code: string) {
    return this.usersRepository.findByEmailConfirmationCodeOrNull(code);
  }

  async confirmUser(code: string) {
    const found =
      await this.usersRepository.findByEmailConfirmationCodeOrNull(code);
    if (found) {
      found.isEmailConfirmed = true;
      await this.usersRepository.update(found);
    }
  }
}
