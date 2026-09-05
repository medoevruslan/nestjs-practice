import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtUserPayload } from '../../../auth/jwtUserPayload';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { DeviceAuthSessionService } from '../device-auth-session.service';
import { DeviceAuthSessionRepository } from '../../infrastructure/device-auth-session.repository';

export class DeleteAllSessionsExceptCurrentCommand {
  constructor(readonly refreshToken: string) {}
}

@CommandHandler(DeleteAllSessionsExceptCurrentCommand)
export class DeleteAllSessionsExceptCurrentUseCase implements ICommandHandler<DeleteAllSessionsExceptCurrentCommand> {
  constructor(
    @Inject() private readonly jwtService: JwtService,
    @Inject()
    private readonly deviceAuthSessionService: DeviceAuthSessionService,
    @Inject()
    private readonly deviceAuthSessionRepository: DeviceAuthSessionRepository,
  ) {}

  async execute(command: DeleteAllSessionsExceptCurrentCommand) {
    try {
      const { deviceId, id: userId } = this.jwtService.verify<JwtUserPayload>(
        command.refreshToken,
      );

      await this.deviceAuthSessionService.validateRefreshTokenForSession(
        deviceId,
        command.refreshToken,
      );

      await this.deviceAuthSessionRepository.revokeAllExceptCurrent(
        userId,
        deviceId,
      );
    } catch (e) {
      // TODO: add production logger
      console.error(
        'bad refresh token on DeleteAllSessionsExceptCurrentCommand',
        e,
      );
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid authorization data',
      });
    }
  }
}
