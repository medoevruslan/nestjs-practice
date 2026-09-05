import { Injectable } from '@nestjs/common';
import { DeviceAuthSessionViewDto } from '../../api/view-dto/device-auth-session-view.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DeviceAuthSessionQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  private readonly selectViewFields = `
    SELECT
      ip,
      device_name AS "deviceName",
      device_id AS "deviceId",
      last_active_at AS "lastActiveAt"
    FROM device_auth_session
  `;

  async getAll(): Promise<DeviceAuthSessionViewDto[]> {
    const found = await this.dataSource.query(this.selectViewFields);
    return found.map(DeviceAuthSessionViewDto.mapToView);
  }

  async getByUserIdOrNotFoundFail(
    userId: string,
  ): Promise<DeviceAuthSessionViewDto[]> {
    const found = await this.dataSource.query(
      `${this.selectViewFields}
       WHERE user_id = $1 AND deleted_at IS NULL`,
      [userId],
    );

    return found.map(DeviceAuthSessionViewDto.mapToView);
  }
}
