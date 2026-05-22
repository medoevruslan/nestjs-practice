import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginInputDto } from '../../api/input-dto/login.input-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { CryptoService } from '../../../user-account/application/crypto-service';
import { Inject } from '@nestjs/common';
import { AuthConfig } from '../../auth.config';
import { UsersService } from '../../../user-account/application/users.service';
import { JwtService } from '@nestjs/jwt';

export class LoginUserCommand {
  constructor(public readonly dto: LoginInputDto) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    @Inject() private readonly cryptoService: CryptoService,
    @Inject() private readonly authConfig: AuthConfig,
    @Inject() private readonly usersService: UsersService,
    @Inject() private readonly jswService: JwtService,
  ) {}

  async execute(command: LoginUserCommand) {
    const { dto } = command;

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

    const payload = { email: dto.loginOrEmail, id: user.id };

    const accessToken = this.jswService.sign(payload);
    const refreshToken = this.jswService.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }
}
