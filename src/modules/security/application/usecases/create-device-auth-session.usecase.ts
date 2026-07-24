import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import {
  DeviceAuthSession,
  DeviceAuthSessionModel,
} from '../../../auth/domain/device-auth-session.entity';
import { CreateDeviceAuthSessionDomainDto } from '../../../auth/domain/dto/create-device-auth-session.domain.dto';
import { Inject } from '@nestjs/common';
import { DeviceAuthSessionRepository } from '../../../auth/infrastructure/device-auth-session.repository';

export class CreateDeviceAuthSessionCommand {
  constructor(public readonly dto: CreateDeviceAuthSessionDomainDto) {}
}

@CommandHandler(CreateDeviceAuthSessionCommand)
export class CreateDeviceAuthSessionUseCase implements ICommandHandler<CreateDeviceAuthSessionCommand> {
  constructor(
    @InjectModel(DeviceAuthSession.name)
    private readonly model: DeviceAuthSessionModel,
    @Inject()
    private readonly deviceAuthSessionRepository: DeviceAuthSessionRepository,
  ) {}

  async execute(command: CreateDeviceAuthSessionCommand) {
    const instance = this.model.createInstance(command.dto);
    await this.deviceAuthSessionRepository.save(instance);
  }
}
