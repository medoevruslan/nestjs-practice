import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateDeviceAuthSessionDto } from '../../domain/dto/update-device-auth-session.dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { Inject } from '@nestjs/common';
import { DeviceAuthSessionRepository } from '../../infrastructure/device-auth-session.repository';

export class UpdateDeviceAuthSessionCommand {
  constructor(readonly dto: UpdateDeviceAuthSessionDto) {}
}

@CommandHandler(UpdateDeviceAuthSessionCommand)
export class UpdateDeviceAuthSessionUseCase implements ICommandHandler<UpdateDeviceAuthSessionCommand> {
  constructor(
    @Inject()
    private readonly deviceAuthSessionRepository: DeviceAuthSessionRepository,
  ) {}
  async execute(command: UpdateDeviceAuthSessionCommand) {
    const updated = await this.deviceAuthSessionRepository.update(command.dto);

    if (!updated) {
      await this.deviceAuthSessionRepository.revokeByDeviceId(
        command.dto.deviceId,
      );

      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Refresh token reuse detected',
      });
    }
  }
}
