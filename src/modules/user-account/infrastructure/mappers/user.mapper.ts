import { Nullable, SqlDate } from 'src/shared/common.types';
import { User } from '../../domain/user.entity';

export type UserSqlRow = {
  id: string | number | bigint;
  email: string;
  login: string;
  first_name: Nullable<string>;
  last_name: Nullable<string>;
  password: string;
  is_email_confirmed: boolean;
  email_confirmation_code: Nullable<string>;
  password_recovery_code: Nullable<string>;
  confirmation_code_expiration: Nullable<SqlDate>;
  created_at: SqlDate;
  updated_at: SqlDate;
  deleted_at: Nullable<SqlDate>;
};

export class UserMapper {
  static fromSqlRow(row: UserSqlRow): User {
    const user = new User();

    user.relationalId = String(row.id);
    user.email = row.email;
    user.login = row.login;
    user.firstName = row.first_name;
    user.lastName = row.last_name;
    user.password = row.password;
    user.isEmailConfirmed = row.is_email_confirmed;
    user.emailConfirmationCode = row.email_confirmation_code;
    user.passwordRecoveryCode = row.password_recovery_code;
    user.confirmationCodeExpiration = this.toNullableDate(
      row.confirmation_code_expiration,
    );
    user.createdAt = this.toDate(row.created_at);
    user.updatedAt = this.toDate(row.updated_at);
    user.deletedAt = this.toNullableDate(row.deleted_at);

    return user;
  }

  private static toDate(value: SqlDate): Date {
    return value instanceof Date ? value : new Date(value);
  }

  private static toNullableDate(value: Nullable<SqlDate>): Nullable<Date> {
    return value === null ? null : this.toDate(value);
  }
}
