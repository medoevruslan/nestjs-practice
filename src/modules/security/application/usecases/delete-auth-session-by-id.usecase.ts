import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import {
  DeviceAuthSession,
  DeviceAuthSessionModel,
} from '../../domain/device-auth-session.entity';

export class DeleteSessionByDeviceIdCommand {
  constructor(readonly deviceId: string) {}
}

@CommandHandler(DeleteSessionByDeviceIdCommand)
export class DeleteSessionByDeviceIdUseCase implements ICommandHandler<DeleteSessionByDeviceIdCommand> {
  constructor(
    @InjectModel(DeviceAuthSession.name)
    private readonly model: DeviceAuthSessionModel,
  ) {}

  async execute(command: DeleteSessionByDeviceIdCommand) {
    const res = await this.model.deleteOne({ deviceId: command.deviceId });
    return res.deletedCount === 1;
  }
}
