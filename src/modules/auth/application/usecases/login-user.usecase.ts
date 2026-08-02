import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginInputDto } from '../../api/input-dto/login.input-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { CryptoService } from '../../../user-account/application/crypto-service';
import { Inject } from '@nestjs/common';
import { AuthConfig } from '../../auth.config';
import { UsersService } from '../../../user-account/application/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateDeviceAuthSessionCommand } from '../../../security/application/usecases/create-device-auth-session.usecase';
import { JwtPayload } from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { JwtUserPayload } from '../../jwtUserPayload';
import bcrypt from 'bcrypt';

export class LoginUserCommand {
  constructor(
    public readonly dto: LoginInputDto,
    public readonly deviceSessionInfo: { ip: string; deviceName: string },
  ) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    @Inject() private readonly jwtService: JwtService,
    @Inject() private readonly cryptoService: CryptoService,
    @Inject() private readonly authConfig: AuthConfig,
    @Inject() private readonly usersService: UsersService,
    @Inject() private readonly commandBus: CommandBus,
  ) {}

  async execute(command: LoginUserCommand) {
    const { dto, deviceSessionInfo } = command;

    const user = await this.usersService.getByLoginOrEmailNullable(
      dto.loginOrEmail,
    );

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid credentials',
      });
    }

    if (!this.authConfig.skipPasswordCheck) {
      const isPass = await this.cryptoService.checkPassword(
        dto.password,
        user.password,
      );

      if (!isPass) {
        throw new DomainException({
          code: DomainExceptionCode.Unauthorized,
          message: 'Invalid credentials',
        });
      }
    }

    const deviceId = randomUUID();

    const payload: JwtUserPayload = {
      email: dto.loginOrEmail,
      id: user.id,
      deviceId,
    };

    const jwtConfig = this.authConfig.getJwtConfig();

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: jwtConfig.refreshTokenExpiresIn,
    });

    const tokenData = this.jwtService.decode(refreshToken, {
      json: true,
    }) as JwtPayload;

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await this.commandBus.execute(
      new CreateDeviceAuthSessionCommand({
        userId: user.id,
        iat: tokenData.iat!,
        exp: tokenData.exp!,
        deviceId,
        ip: deviceSessionInfo.ip,
        deviceName: deviceSessionInfo.deviceName,
        refreshTokenHash,
      }),
    );

    return { accessToken, refreshToken };
  }
}
