import { Inject } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { AuthConfig } from '../../auth.config';
import { JwtUserPayload } from '../../jwtUserPayload';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { DeviceAuthSessionService } from '../../../security/application/device-auth-session.service';
import { UpdateDeviceAuthSessionCommand } from 'src/modules/security/application/usecases/update-device-auth-session.usecase';
import bcrypt from 'bcrypt';
import { JwtPayload } from 'jsonwebtoken';
import { randomUUID } from 'crypto';

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
    const { refreshToken: incomingRefreshToken } = command;
    const jwtConfig = this.authConfig.getJwtConfig();
    let jwtPayload: JwtUserPayload;

    try {
      jwtPayload = this.jwtService.verify<JwtUserPayload>(incomingRefreshToken);
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

    await this.deviceAuthSessionService.validateRefreshTokenForSession(
      jwtPayload.deviceId,
      incomingRefreshToken,
    );

    const { deviceId, email, id } = jwtPayload;

    const accessToken = this.jwtService.sign({ deviceId, email, id });
    const refreshToken = this.jwtService.sign(
      { deviceId, email, id },
      {
        expiresIn: jwtConfig.refreshTokenExpiresIn,
        jwtid: randomUUID(),
      },
    );

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    const refreshTokenData = this.jwtService.decode(refreshToken, {
      json: true,
    }) as JwtPayload;

    await this.commandBus.execute(
      new UpdateDeviceAuthSessionCommand({
        sessionId: currentDeviceSession.id,
        deviceId: currentDeviceSession.deviceId,
        userId: currentDeviceSession.userId,
        currentRefreshTokenHash: currentDeviceSession.refreshTokenHash!,
        exp: refreshTokenData.exp!,
        iat: refreshTokenData.iat!,
        refreshTokenHash,
        lastActiveAt: Date.now(),
      }),
    );

    return { accessToken, refreshToken };
  }
}
