import { Inject, Injectable } from '@nestjs/common';
import { DeviceAuthSessionRepository } from '../infrastructure/device-auth-session.repository';

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
}
