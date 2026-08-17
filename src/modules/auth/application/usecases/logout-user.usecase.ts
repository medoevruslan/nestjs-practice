import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DeviceAuthSessionRepository } from 'src/modules/security/infrastructure/device-auth-session.repository';
import { JwtUserPayload } from '../../jwtUserPayload';
import { DeviceAuthSessionService } from 'src/modules/security/application/device-auth-session.service';

export class LogoutUserCommand {
  constructor(readonly refreshToken: string) {}
}

@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase implements ICommandHandler<LogoutUserCommand> {
  constructor(
    @Inject() private readonly jwtService: JwtService,
    @Inject()
    private readonly deviceAuthSessionService: DeviceAuthSessionService,
  ) {}

  async execute(command: LogoutUserCommand) {
    const { refreshToken } = command;
    let jwtPayload: JwtUserPayload;

    try {
      jwtPayload = this.jwtService.verify<JwtUserPayload>(refreshToken);
    } catch (error) {
      throw new DomainException({
        code: DomainExceptionCode.ValidationError,
        message: 'Invalid authorization token',
      });
    }

    await this.deviceAuthSessionService.validateRefreshTokenForSession(
      jwtPayload.deviceId,
      refreshToken,
    );

    await this.deviceAuthSessionService.revokeDeviceAuthSessionByDeviceId(
      jwtPayload.deviceId,
    );
  }
}
