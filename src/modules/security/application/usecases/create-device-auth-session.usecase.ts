import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import {
  DeviceAuthSession,
  DeviceAuthSessionModel,
} from '../../domain/device-auth-session.entity';
import { CreateDeviceAuthSessionDomainDto } from '../../domain/dto/create-device-auth-session.domain.dto';
import { Inject } from '@nestjs/common';
import { UsersService } from '../../../user-account/application/users.service';
import { DeviceAuthSessionRepository } from '../../infrastructure/device-auth-session.repository';

export class CreateDeviceAuthSessionCommand {
  constructor(public readonly dto: CreateDeviceAuthSessionDomainDto) { }
}

@CommandHandler(CreateDeviceAuthSessionCommand)
export class CreateDeviceAuthSessionUseCase implements ICommandHandler<CreateDeviceAuthSessionCommand> {
  constructor(
    @InjectModel(DeviceAuthSession.name)
    private readonly model: DeviceAuthSessionModel,
    @Inject()
    private readonly deviceAuthSessionRepository: DeviceAuthSessionRepository,
    @Inject() private readonly usersService: UsersService,
  ) { }

  async execute(command: CreateDeviceAuthSessionCommand) {
    await this.usersService.getByIdOrFail(command.dto.userId.toString());
    const instance = this.model.createInstance(command.dto);
    await this.deviceAuthSessionRepository.save(instance);
  }
}
