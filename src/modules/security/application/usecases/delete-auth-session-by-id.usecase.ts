import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { Inject } from '@nestjs/common';
import { DeviceAuthSessionRepository } from '../../infrastructure/device-auth-session.repository';

export class DeleteSessionByDeviceIdCommand {
  constructor(
    readonly deviceId: string,
    readonly userId: string,
  ) {}
}

@CommandHandler(DeleteSessionByDeviceIdCommand)
export class DeleteSessionByDeviceIdUseCase implements ICommandHandler<DeleteSessionByDeviceIdCommand> {
  constructor(
    @Inject()
    private readonly deviceAuthSessionRepository: DeviceAuthSessionRepository,
  ) {}

  async execute(command: DeleteSessionByDeviceIdCommand) {
    const session =
      await this.deviceAuthSessionRepository.getDeviceAuthSessionByDeviceIdOrFault(
        command.deviceId,
      );

    if (session.userId !== command.userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'delete session forbidden',
      });
    }

    return this.deviceAuthSessionRepository.revokeByDeviceId(command.deviceId);
  }
}
