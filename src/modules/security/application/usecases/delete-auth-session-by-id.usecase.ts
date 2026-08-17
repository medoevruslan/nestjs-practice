import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import {
  DeviceAuthSession,
  DeviceAuthSessionModel,
} from '../../domain/device-auth-session.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

export class DeleteSessionByDeviceIdCommand {
  constructor(
    readonly deviceId: string,
    readonly userId: string,
  ) {}
}

@CommandHandler(DeleteSessionByDeviceIdCommand)
export class DeleteSessionByDeviceIdUseCase implements ICommandHandler<DeleteSessionByDeviceIdCommand> {
  constructor(
    @InjectModel(DeviceAuthSession.name)
    private readonly model: DeviceAuthSessionModel,
  ) {}

  async execute(command: DeleteSessionByDeviceIdCommand) {
    const session = await this.model.findOne({
      deviceId: command.deviceId,
      deletedAt: null,
    });

    if (!session) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'device auth session not found',
      });
    }

    if (session.userId.toString() !== command.userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'delete session forbidden',
      });
    }

    const res = await this.model.updateOne(
      { deviceId: command.deviceId, userId: command.userId, deletedAt: null },
      { $set: { deletedAt: new Date() } },
    );
    return res.modifiedCount === 1;
  }
}
