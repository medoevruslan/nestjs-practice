import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import {
  DeviceAuthSession,
  DeviceAuthSessionModel,
} from '../../domain/device-auth-session.entity';
import { CreateDeviceAuthSessionDomainDto } from '../../domain/dto/create-device-auth-session.domain.dto';

export class UpdateDeviceAuthSessionCommand {
  constructor(readonly dto: CreateDeviceAuthSessionDomainDto) {}
}

@CommandHandler(UpdateDeviceAuthSessionCommand)
export class UpdateDeviceAuthSessionUseCase implements ICommandHandler<UpdateDeviceAuthSessionCommand> {
  constructor(
    @InjectModel(DeviceAuthSession.name)
    private readonly model: DeviceAuthSessionModel,
  ) {}
  async execute(command: UpdateDeviceAuthSessionCommand) {
    const {
      dto: { deviceId, userId, ...updateData },
    } = command;
    await this.model.updateOne(
      { deviceId, userId },
      { $set: { ...updateData } },
    );
  }
}
