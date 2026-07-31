import { Inject } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { AuthConfig } from '../../auth.config';
import { JwtUserPayload } from '../../jwtUserPayload';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { DeviceAuthSessionService } from '../../../security/application/device-auth-session.service';
import { UpdateDeviceAuthSessionCommand } from 'src/modules/security/application/usecases/update-device-auth-session.usecase';

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
    @Inject() private readonly commandBus: CommandBus,
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

    const currentDeviceSession =
      await this.deviceAuthSessionService.getDeviceAuthSessionByDeviceIdOrFault(
        jwtPayload.deviceId,
      );

    const accessToken = this.jwtService.sign(jwtPayload, {
      secret: jwtConfig.secret,
    });
    const refreshToken = this.jwtService.sign(jwtPayload, {
      expiresIn: jwtConfig.expiresIn,
    });

    const { deviceId, userId, iat, exp, ip, deviceName } = currentDeviceSession;

    await this.commandBus.execute(
      new UpdateDeviceAuthSessionCommand({
        deviceId,
        userId,
        exp,
        iat,
        deviceName,
        ip,
      }),
    );

    return { accessToken, refreshToken };
  }
}
