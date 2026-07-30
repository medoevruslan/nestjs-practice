import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { AuthConfig } from '../../auth.config';
import { JwtUserPayload } from '../../jwtUserPayload';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { DeviceAuthSessionService } from '../../../security/application/device-auth-session.service';

export class RefreshTokenCommand {
  constructor(public readonly refreshToken: string) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    @Inject() private readonly jwtService: JwtService,
    @Inject() private readonly authConfig: AuthConfig,
    @Inject()
    private readonly deviceAuthSessionService: DeviceAuthSessionService,
  ) {}
  async execute(command: RefreshTokenCommand) {
    const { refreshToken: refreshTokenOld } = command;
    const jwtConfig = this.authConfig.getJwtConfig();
    let jwtPayload: JwtUserPayload;

    try {
      jwtPayload = this.jwtService.verify<JwtUserPayload>(refreshTokenOld, {
        secret: jwtConfig.secret,
      });
    } catch (error) {
      throw new DomainException({
        code: DomainExceptionCode.ValidationError,
        message: 'Invalid authorization token',
      });
    }

    await this.deviceAuthSessionService.getDeviceAuthSessionByDeviceIdOrFault(
      jwtPayload.deviceId,
    );

    const accessToken = this.jwtService.sign(jwtPayload, {
      secret: jwtConfig.secret,
    });
    const refreshToken = this.jwtService.sign(jwtPayload, {
      expiresIn: jwtConfig.expiresIn,
    });
  }
}
