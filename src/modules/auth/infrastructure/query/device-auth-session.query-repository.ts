import { InjectModel } from '@nestjs/mongoose';
import {
  DeviceAuthSession,
  DeviceAuthSessionModel,
} from '../../../security/domain/device-auth-session.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DeviceAuthSessionQueryRepository {
  constructor(
    @InjectModel(DeviceAuthSession.name)
    private readonly Model: DeviceAuthSessionModel,
  ) {}

  async getAll() {
    return this.Model.find({});
  }

  async getByUserIdOrNotFoundFail(userId: string) {
    const found = await this.Model.findOne({ userId, deletedAt: null });

    if (!found) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'device auth session not found',
      });
    }

    return found;
  }
}
