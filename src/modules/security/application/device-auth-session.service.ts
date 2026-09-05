import { Inject, Injectable } from '@nestjs/common';
import { DeviceAuthSessionRepository } from '../infrastructure/device-auth-session.repository';
import bcrypt from 'bcrypt';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class DeviceAuthSessionService {
  constructor(
    @Inject()
    private readonly deviceAuthSessionRepository: DeviceAuthSessionRepository,
  ) {}

  async getAll() {}

  async getByUserId() {}

  async getDeviceAuthSessionByDeviceIdOrFault(id: string) {
    return this.deviceAuthSessionRepository.getDeviceAuthSessionByDeviceIdOrFault(
      id,
    );
  }

  async revokeDeviceAuthSessionByDeviceId(id: string) {
    await this.getDeviceAuthSessionByDeviceIdOrFault(id);
    await this.deviceAuthSessionRepository.revokeByDeviceId(id);
  }

  async validateRefreshTokenForSession(deviceId: string, refreshToken: string) {
    const found =
      await this.deviceAuthSessionRepository.getDeviceAuthSessionByDeviceIdOrFault(
        deviceId,
      );

    const isTokenValid = await bcrypt.compare(
      refreshToken,
      found.refreshTokenHash!,
    );

    if (!isTokenValid) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid authorization data',
      });
    }
  }
}
