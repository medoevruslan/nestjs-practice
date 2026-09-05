import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateDeviceAuthSessionDomainDto } from '../../domain/dto/create-device-auth-session.domain.dto';
import { Inject } from '@nestjs/common';
import { UsersService } from '../../../user-account/application/users.service';
import { DeviceAuthSessionRepository } from '../../infrastructure/device-auth-session.repository';

export class CreateDeviceAuthSessionCommand {
  constructor(public readonly dto: CreateDeviceAuthSessionDomainDto) {}
}

@CommandHandler(CreateDeviceAuthSessionCommand)
export class CreateDeviceAuthSessionUseCase implements ICommandHandler<CreateDeviceAuthSessionCommand> {
  constructor(
    @Inject()
    private readonly deviceAuthSessionRepository: DeviceAuthSessionRepository,
    @Inject() private readonly usersService: UsersService,
  ) {}

  async execute(command: CreateDeviceAuthSessionCommand) {
    await this.usersService.getByIdOrFailRaw(command.dto.userId.toString());
    await this.deviceAuthSessionRepository.create(command.dto);
  }
}
