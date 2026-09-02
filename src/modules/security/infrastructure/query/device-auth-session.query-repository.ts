import { InjectModel } from '@nestjs/mongoose';
import {
  DeviceAuthSession,
  DeviceAuthSessionModel,
} from '../../domain/device-auth-session.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { Injectable } from '@nestjs/common';
import { DeviceAuthSessionViewDto } from '../../api/view-dto/device-auth-session-view.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DeviceAuthSessionQueryRepository {
  constructor(
    @InjectModel(DeviceAuthSession.name)
    private readonly Model: DeviceAuthSessionModel,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async _getAll() {
    const res = await this.Model.find({});
    return res.map(DeviceAuthSessionViewDto.mapToView);
  }
  async getAll() {
    return this.dataSource.query(`SELECT * FROM device_auth_session`);
    // const res = await this.Model.find({});
    // return res.map(DeviceAuthSessionViewDto.mapToView);
  }

  async getByUserIdOrNotFoundFail(userId: string) {
    const found = await this.dataSource.query(
      `SELECT * FROM device_auth_session WHERE user_id = $1 AND deleted_at IS NULL`,
      [userId],
    );
    // const found = await this.Model.find({ userId, deletedAt: null });

    if (!found) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'device auth session not found',
      });
    }

    return found.map(DeviceAuthSessionViewDto.mapToView);
  }
}
