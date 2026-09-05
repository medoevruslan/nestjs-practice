import { Inject, Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { User } from '../domain/user.entity';

@Injectable()
export class UsersService {
  constructor(@Inject() private usersRepository: UsersRepository) {}

  async save(user: User) {
    await this.usersRepository.save(user);
  }

  async getByIdOrFail(id: string) {
    return this.usersRepository.findByIdOrFail(id);
  }

  async getByIdOrFailRaw(id: string) {
    return this.usersRepository.findByIdOrFailRaw(id);
  }

  async getByEmail(email: string) {
    return this.usersRepository.findByEmailOrFail(email);
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

  async getByPasswordRecoveryCode(code: string) {
    return this.usersRepository.findByPasswordRecoveryCodeOrFail(code);
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
      await this.usersRepository.save(found);
    }
  }
}
