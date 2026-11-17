import { Injectable } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Nullable } from 'src/shared/common.types';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private readonly usersRepoOrm: Repository<User>,
  ) {}

  async update(user: User) {
    const { id, ...changes } = user;
    const result = await this.usersRepoOrm.update({ id }, changes);

    return result.affected === 1;
  }

  async delete(userId: string) {
    const result = await this.usersRepoOrm.delete({ id: userId });

    return result.affected === 1;
  }

  async findByIdOrFail(id: string): Promise<User> {
    const result = await this.usersRepoOrm.findOneBy({
      id,
    });

    if (!result) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return result;
  }

  async findByEmailOrLoginOrNull(
    loginOrEmail: string,
  ): Promise<Nullable<User>> {
    const found = await this.usersRepoOrm.findOne({
      where: [
        { login: loginOrEmail, deletedAt: IsNull() },
        { email: loginOrEmail, deletedAt: IsNull() },
      ],
    });

    return found;
  }

  async findByEmailOrNull(email: string): Promise<Nullable<User>> {
    const found = await this.usersRepoOrm.findOneBy({
      email,
      deletedAt: IsNull(),
    });

    return found;
  }

  async findByLoginOrNull(login: string): Promise<Nullable<User>> {
    const found = await this.usersRepoOrm.findOneBy({
      login,
      deletedAt: IsNull(),
    });

    return found;
  }

  async findByEmailConfirmationCodeOrNull(
    code: string,
  ): Promise<Nullable<User>> {
    const found = await this.usersRepoOrm.findOneBy({
      emailConfirmationCode: code,
      deletedAt: IsNull(),
    });

    return found;
  }

  async findByPasswordRecoveryCodeOrNull(
    code: string,
  ): Promise<Nullable<User>> {
    const found = await this.usersRepoOrm.findOneBy({
      passwordRecoveryCode: code,
      deletedAt: IsNull(),
    });

    return found;
  }
}
