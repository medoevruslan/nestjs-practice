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
    const session = await this.getDeviceAuthSessionByDeviceIdOrFault(id);
    session.markDeleted();
    await this.deviceAuthSessionRepository.save(session);
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
      await this.revokeDeviceAuthSessionByDeviceId(deviceId);

      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid authorization data',
      });
    }
  }
}
