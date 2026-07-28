import { Injectable } from '@nestjs/common';
import { DeviceAuthSessionDocument } from '../../security/domain/device-auth-session.entity';

@Injectable()
export class DeviceAuthSessionRepository {
  constructor() {}

  async save(document: DeviceAuthSessionDocument) {
    await document.save();
  }
}
