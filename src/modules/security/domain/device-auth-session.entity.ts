import { CreateDeviceAuthSessionDomainDto } from './dto/create-device-auth-session.domain.dto';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/modules/user-account/domain/user.entity';
import { Nullable } from 'src/shared/common.types';
import { CURRENT_TIMESTAMP } from 'src/database/constants';

@Entity('device_auth_session')
export class DeviceAuthSession {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'ip', nullable: false, type: 'varchar' })
  ip: string;

  @Column({ name: 'device_id', nullable: false, type: 'uuid' })
  deviceId: string;

  @Column({ name: 'device_name', nullable: false, type: 'varchar' })
  deviceName: string;

  @Column({ name: 'iat', nullable: false, type: 'bigint' })
  iat: number;

  @Column({ name: 'exp', nullable: false, type: 'bigint' })
  exp: number;

  @Column({ name: 'last_active_at', nullable: false, type: 'bigint' })
  lastActiveAt: Nullable<number>;

  @Column({ name: 'refresh_token_hash', default: null, type: 'varchar' })
  refreshTokenHash: Nullable<string>;

  @CreateDateColumn({
    name: 'created_at',
    default: () => CURRENT_TIMESTAMP,
    type: 'timestamp with time zone',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    default: () => CURRENT_TIMESTAMP,
    type: 'timestamp with time zone',
  })
  updatedAt: Date;

  @Column({
    name: 'deleted_at',
    default: null,
    type: 'timestamp with time zone',
  })
  deletedAt: Nullable<Date>;

  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  public static createInstance(
    dto: CreateDeviceAuthSessionDomainDto,
  ): DeviceAuthSession {
    const instance = new this();
    instance.ip = dto.ip;
    instance.exp = dto.exp;
    instance.iat = dto.iat;
    instance.userId = dto.userId;
    instance.deviceId = dto.deviceId;
    instance.deviceName = dto.deviceName;
    instance.lastActiveAt = Date.now();
    instance.refreshTokenHash = dto.refreshTokenHash;
    return instance;
  }

  markDeleted() {
    if (this.deletedAt != null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }
}
