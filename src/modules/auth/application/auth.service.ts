import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from '../../user-account/application/crypto-service';
import { AuthConfig } from '../auth.config';
import { UsersService } from '../../user-account/application/users.service';
import { NewPasswordDto } from '../dto/new-password.dto';
import { AbstractEmailSender } from './port/abstract-email-sender';
import { UserViewDto } from '../api/view-dto/user-view.dto';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class AuthService {
  private readonly jswService: JwtService;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject() private readonly cryptoService: CryptoService,
    @Inject() private readonly authConfig: AuthConfig,
    @Inject() private readonly usersService: UsersService,
    @Inject() private readonly emailSender: AbstractEmailSender,
  ) {
    this.jswService = new JwtService({
      secret: this.authConfig.jwtSecret,
      signOptions: { expiresIn: this.authConfig.expiresIn },
    });
  }

  async me(userId: string) {
    const user = await this.usersService.getByIdOrFail(userId);
    return UserViewDto.mapToView(user);
  }

  async newPassword(dto: NewPasswordDto) {
    const found = await this.usersService.getByPasswordRecoveryCodeNullable(
      dto.code,
    );

    if (
      !found ||
      !found.confirmationCodeExpiration ||
      Date.now() > found.confirmationCodeExpiration.getTime()
    ) {
      throw new DomainException({
        code: DomainExceptionCode.PasswordRecoveryCodeExpired,
        message: 'Recovery code is invalid or expired',
      });
    }

    const hashedPassword = await this.cryptoService.hashPassword(dto.password);

    found.password = hashedPassword;
    found.confirmationCodeExpiration = null;
    found.passwordRecoveryCode = null;
    await this.usersService.save(found);
  }
}
