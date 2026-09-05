import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../domain/user.entity';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserMapper, UserSqlRow } from './mappers/user.mapper';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async save(user: User): Promise<boolean> {
    if (user.relationalId) {
      return this.update(user);
    }

    await (user as UserDocument).save();
    return true;
  }

  async update(user: User) {
    const updated = await this.dataSource.query<{ id: string }[]>(
      `
          UPDATE users
          SET
            email = $1,
            login = $2,
            first_name = $3,
            last_name = $4,
            password = $5,
            is_email_confirmed = $6,
            email_confirmation_code = $7,
            password_recovery_code = $8,
            confirmation_code_expiration = $9,
            updated_at = NOW(),
            deleted_at = $10
          WHERE id = $11
          RETURNING id::text AS id
        `,
      [
        user.email,
        user.login,
        user.firstName,
        user.lastName,
        user.password,
        user.isEmailConfirmed,
        user.emailConfirmationCode,
        user.passwordRecoveryCode,
        user.confirmationCodeExpiration,
        user.deletedAt,
        user.relationalId,
      ],
    );

    return updated.length === 1;
  }

  async delete(userId: string) {
    const deleted = await this.dataSource.query<{ id: string }[]>(
      'UPDATE users set deleted_at = NOW(), updated_at = NOW() WHERE id=$1 AND deleted_at IS NULL RETURNING id::text AS id',
      [userId],
    );

    return deleted.length === 1;
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
    const [found] = await this.dataSource.query<UserSqlRow[]>(
      'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
      [id],
    );

    if (!found) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found',
      });
    }

    return UserMapper.fromSqlRow(found);
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

  async findByEmailOrEmailOrNull(loginOrEmail: string): Promise<User | null> {
    const [found] = await this.dataSource.query<UserSqlRow[]>(
      `
        SELECT *
        FROM users
        WHERE (email = $1 OR login = $1) AND deleted_at IS NULL
        LIMIT 1
      `,
      [loginOrEmail],
    );

    return found ? UserMapper.fromSqlRow(found) : null;
  }

  async findByEmailOrNull(email: string): Promise<User | null> {
    const [found] = await this.dataSource.query<UserSqlRow[]>(
      'SELECT * FROM users WHERE email=$1 AND deleted_at IS NULL',
      [email],
    );

    return found ? UserMapper.fromSqlRow(found) : null;
  }

  async findByLoginOrNull(login: string): Promise<User | null> {
    const [found] = await this.dataSource.query<UserSqlRow[]>(
      'SELECT * FROM users WHERE login=$1 AND deleted_at IS NULL',
      [login],
    );

    return found ? UserMapper.fromSqlRow(found) : null;
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

  async findByEmailConfirmationCodeOrNull(code: string): Promise<User | null> {
    const [res] = await this.dataSource.query<UserSqlRow[]>(
      'SELECT * FROM users WHERE email_confirmation_code = $1 AND deleted_at IS NULL',
      [code],
    );
    return res ? UserMapper.fromSqlRow(res) : null;
  }

  async findByPasswordRecoveryCodeOrNull(code: string): Promise<User | null> {
    const [res] = await this.dataSource.query<UserSqlRow[]>(
      'SELECT * FROM users WHERE password_recovery_code = $1 AND deleted_at IS NULL',
      [code],
    );
    return res ? UserMapper.fromSqlRow(res) : null;
  }
}
