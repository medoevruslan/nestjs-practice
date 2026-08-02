import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import {
  DeviceAuthSession,
  DeviceAuthSessionModel,
} from '../../domain/device-auth-session.entity';
import { UpdateDeviceAuthSessionDto } from '../../domain/dto/update-device-auth-session.dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

export class UpdateDeviceAuthSessionCommand {
  constructor(readonly dto: UpdateDeviceAuthSessionDto) {}
}

@CommandHandler(UpdateDeviceAuthSessionCommand)
export class UpdateDeviceAuthSessionUseCase implements ICommandHandler<UpdateDeviceAuthSessionCommand> {
  constructor(
    @InjectModel(DeviceAuthSession.name)
    private readonly model: DeviceAuthSessionModel,
  ) {}
  async execute(command: UpdateDeviceAuthSessionCommand) {
    const {
      dto: {
        userId,
        currentRefreshTokenHash,
        deviceId,
        sessionId,
        ...updateData
      },
    } = command;
    const updated = await this.model.updateOne(
      {
        _id: sessionId,
        userId,
        deviceId,
        refreshTokenHash: currentRefreshTokenHash,
        deletedAt: null,
      },
      {
        $set: {
          iat: updateData.iat,
          exp: updateData.exp,
          refreshTokenHash: updateData.refreshTokenHash,
          lastActiveAt: updateData.lastActiveAt,
        },
      },
    );

    if (updated.modifiedCount !== 1) {
      await this.model.updateOne(
        { _id: sessionId },
        { $set: { deletedAt: new Date() } },
      );

      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Refresh token reuse detected',
      });
    }
  }
}
