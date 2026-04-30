import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from '../../user-account/application/crypto-service';
import { AuthConfig } from '../auth.config';
import { UsersService } from '../../user-account/application/users.service';
import { RegisterUserDto } from '../dto/register-user.dto';
import { NewPasswordDto } from '../dto/new-password.dto';
import { LoginDto } from '../dto/login.dto';
import { EmailConfirmationInputDto } from '../api/input-dto/email.confirmation.input-dto';
import { PasswordRecoveryInputDto } from '../api/input-dto/password-recovery-input.dto';
import { AbstractEmailSender } from './port/abstract-email-sender';

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

  async login(dto: LoginDto) {
    const user = await this.usersService.getByEmailNullable(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!this.authConfig.skipPasswordCheck) {
      const isPass = await this.cryptoService.checkPassword(
        dto.password,
        user.password,
      );

      if (!isPass) {
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    const payload = { email: dto.email, id: user.id };

    const accessToken = this.jswService.sign(payload);
    const refreshToken = this.jswService.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken };
  }

  async register(dto: RegisterUserDto) {
    const found = await this.usersService.getByEmailNullable(dto.email);

    if (found) {
      throw new BadRequestException('User already exists');
    }

    await this.usersService.createUser(dto);

    await this.emailSender.sendEmailConfirmation(dto.email, '123456');
  }

  async confirmRegistration(dto: EmailConfirmationInputDto) {
    // TODO: implement full workflow
    await this.emailSender.sendEmailConfirmation(dto.email, dto.code);
  }

  async recoveryPassword(dto: PasswordRecoveryInputDto) {
    const code = await this.usersService.createPasswordRecoveryCode(dto.email);
    if (code) {
      try {
        await this.emailSender.sendPasswordRecovery(dto.email, code);
      } catch (error: unknown) {
        this.logger.error(
          `Failed to send password recovery email for ${dto.email}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }
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
      throw new BadRequestException('Recovery code is invalid or expired');
    }

    const hashedPassword = await this.cryptoService.hashPassword(dto.password);

    found.updatePassword({ password: hashedPassword });
    found.confirmationCodeExpiration = null;
    found.passwordRecoveryCode = null;
    await this.usersService.save(found);
  }
}
