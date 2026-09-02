import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../domain/user.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async save(user: UserDocument) {
    await user.save();
  }

  async findByIdOrFail(id: string): Promise<UserDocument> {
    const found = await this.UserModel.findOne({ _id: id, deletedAt: null });

    if (!found) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return found;
  }

  async findByIdOrFailRaw(id: string): Promise<User> {
    // const found = await this.UserModel.findOne({ _id: id, deletedAt: null });

    const found = await this.dataSource.query<User>(
      'SELECT * FROM users WHERE id = $1',
      [id],
    );

    if (!found) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return found;
  }

  async findByIdOrNull(id: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({ _id: id, deletedAt: null });
  }

  async findByEmailOrFail(email: string): Promise<UserDocument> {
    const found = await this.UserModel.findOne({ email, deletedAt: null });

    if (!found) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return found;
  }

  async findByEmailOrEmailOrNull(
    loginOrEmail: string,
  ): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      $or: [
        { email: loginOrEmail, deletedAt: null },
        { login: loginOrEmail, deletedAt: null },
      ],
    });
  }

  async findByEmailOrNull(email: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({ email, deletedAt: null });
  }

  async findByLoginOrNull(login: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({ login, deletedAt: null });
  }

  async findByEmailConfirmationCodeOrFail(code: string): Promise<UserDocument> {
    const found = await this.UserModel.findOne({
      emailConfirmationCode: code,
      deletedAt: null,
    });

    if (!found) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return found;
  }

  async findByPasswordRecoveryCodeOrFail(code: string): Promise<UserDocument> {
    const found = await this.UserModel.findOne({
      passwordRecoveryCode: code,
      deletedAt: null,
    });

    if (!found) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return found;
  }

  async findByEmailConfirmationCodeOrNull(
    code: string,
  ): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      emailConfirmationCode: code,
      deletedAt: null,
    });
  }

  async findByPasswordRecoveryCodeOrNull(
    code: string,
  ): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      passwordRecoveryCode: code,
      deletedAt: null,
    });
  }
}
