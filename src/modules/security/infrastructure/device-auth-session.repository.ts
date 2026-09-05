import { Injectable } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateDeviceAuthSessionDomainDto } from '../domain/dto/create-device-auth-session.domain.dto';
import { UpdateDeviceAuthSessionDto } from '../domain/dto/update-device-auth-session.dto';

export type DeviceAuthSessionRecord = {
  id: string;
  userId: string;
  ip: string;
  deviceId: string;
  deviceName: string;
  iat: number;
  exp: number;
  lastActiveAt: number;
  refreshTokenHash: string;
};

@Injectable()
export class DeviceAuthSessionRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async create(dto: CreateDeviceAuthSessionDomainDto): Promise<void> {
    await this.dataSource.query(
      `
        INSERT INTO device_auth_session (
          ip,
          device_name,
          device_id,
          exp,
          iat,
          refresh_token_hash,
          last_active_at,
          user_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        dto.ip,
        dto.deviceName,
        dto.deviceId,
        dto.exp,
        dto.iat,
        dto.refreshTokenHash,
        Date.now(),
        dto.userId.toString(),
      ],
    );
  }

  async getDeviceAuthSessionByDeviceIdOrFault(
    id: string,
  ): Promise<DeviceAuthSessionRecord> {
    const [found] = await this.dataSource.query<DeviceAuthSessionRecord[]>(
      `
        SELECT
          id::text AS id,
          user_id::text AS "userId",
          ip,
          device_id AS "deviceId",
          device_name AS "deviceName",
          iat,
          exp,
          last_active_at AS "lastActiveAt",
          refresh_token_hash AS "refreshTokenHash"
        FROM device_auth_session
        WHERE device_id = $1 AND deleted_at IS NULL
        LIMIT 1
      `,
      [id],
    );

    if (!found) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'device auth session not found',
      });
    }

    return found;
  }

  async revokeByDeviceId(deviceId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
        UPDATE device_auth_session
        SET deleted_at = NOW(), updated_at = NOW()
        WHERE device_id = $1 AND deleted_at IS NULL
        RETURNING id
      `,
      [deviceId],
    );

    return result.length === 1;
  }

  async revokeAllExceptCurrent(
    userId: string,
    currentDeviceId: string,
  ): Promise<void> {
    await this.dataSource.query(
      `
        UPDATE device_auth_session
        SET deleted_at = NOW(), updated_at = NOW()
        WHERE user_id = $1 AND device_id <> $2 AND deleted_at IS NULL
      `,
      [userId, currentDeviceId],
    );
  }

  async update(dto: UpdateDeviceAuthSessionDto): Promise<boolean> {
    const result = await this.dataSource.query(
      `
        UPDATE device_auth_session
        SET
          iat = $1,
          exp = $2,
          refresh_token_hash = $3,
          last_active_at = $4,
          updated_at = NOW()
        WHERE
          id = $5
          AND user_id = $6
          AND device_id = $7
          AND refresh_token_hash = $8
          AND deleted_at IS NULL
        RETURNING id
      `,
      [
        dto.iat,
        dto.exp,
        dto.refreshTokenHash,
        dto.lastActiveAt,
        dto.sessionId,
        dto.userId,
        dto.deviceId,
        dto.currentRefreshTokenHash,
      ],
    );

    return result.length === 1;
  }
}
