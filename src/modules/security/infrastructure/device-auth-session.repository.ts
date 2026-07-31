import { Injectable } from '@nestjs/common';
import {
  DeviceAuthSession,
  DeviceAuthSessionDocument,
  DeviceAuthSessionModel,
} from '../domain/device-auth-session.entity';
import { InjectModel } from '@nestjs/mongoose';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class DeviceAuthSessionRepository {
  constructor(
    @InjectModel(DeviceAuthSession.name)
    private readonly model: DeviceAuthSessionModel,
  ) {}

  async save(document: DeviceAuthSessionDocument) {
    await document.save();
  }

  async getDeviceAuthSessionByDeviceIdOrFault(id: string) {
    const found = await this.model.findOne({ deviceId: id }).lean();
    if (!found) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'device auth session not found',
      });
    }

    return found;
  }
}
