import { UpdateUserEmailDto } from '../dto/update-user-email.dto';
import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Nullable } from 'src/shared/common.types';
import { CURRENT_TIMESTAMP } from 'src/database/constants';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string;

  @Column({ name: 'email', type: 'varchar', unique: true, nullable: false })
  email: string;

  @Check(`char_length("login") BETWEEN 3 AND 10`)
  @Column({
    name: 'login',
    type: 'varchar',
    unique: true,
    nullable: false,
    length: 10,
  })
  login: string;

  @Column({ name: 'first_name', type: 'varchar', default: null })
  firstName: Nullable<string>;

  @Column({ name: 'last_name', type: 'varchar', default: null })
  lastName: Nullable<string>;

  get fullName() {
    return `${this.firstName ?? ''} ${this.lastName ?? ''}`;
  }

  @Column({ name: 'password', type: 'varchar', nullable: false })
  password: string;

  @Column({ name: 'is_email_confirmed', type: 'boolean', default: false })
  isEmailConfirmed: boolean;

  @Column({ name: 'email_confirmation_code', type: 'varchar', default: null })
  emailConfirmationCode: Nullable<string>;

  @Column({ name: 'password_recovery_code', type: 'varchar', default: null })
  passwordRecoveryCode: Nullable<string>;

  @Column({
    name: 'confirmation_code_expiration',
    type: 'timestamp with time zone',
    default: null,
  })
  confirmationCodeExpiration: Nullable<Date>;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
    default: () => CURRENT_TIMESTAMP,
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
    default: () => CURRENT_TIMESTAMP,
  })
  updatedAt: Date;

  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'timestamp with time zone',
    default: null,
  })
  deletedAt: Nullable<Date>;

  markDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }

  updateEmail(dto: UpdateUserEmailDto) {
    if (!this.isEmailConfirmed) {
      throw Error('Update not allowed: email is not confirmed');
    }
    this.email = dto.email;
    this.isEmailConfirmed = false;
  }
}
