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
import { PasswordRecoveryInputDto } from '../api/input-dto/password-recovery-input.dto';
import { AbstractEmailSender } from './port/abstract-email-sender';
import { UserViewDto } from '../api/view-dto/user-view.dto';

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
    const user = await this.usersService.getById(userId);
    return UserViewDto.mapToView(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.getByLoginOrEmailNullable(
      dto.loginOrEmail,
    );

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

    const payload = { email: dto.loginOrEmail, id: user.id };

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
    await this.handleRegistrationConfirmation(dto.email);
  }

  async confirmRegistration(dto: { code: string }) {
    const found = await this.usersService.getByEmailConfirmationCodeNullable(
      dto.code,
    );

    if (
      !found ||
      !found.confirmationCodeExpiration ||
      Date.now() > found.confirmationCodeExpiration.getTime()
    ) {
      throw new BadRequestException('Confirmation code is invalid or expired');
    }

    found.isEmailConfirmed = true;
    found.confirmationCodeExpiration = null;
    await this.usersService.save(found);
  }

  async recoveryPassword(dto: PasswordRecoveryInputDto) {
    const code = await this.createPasswordRecoveryCode(dto.email);
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

    found.password = hashedPassword;
    found.confirmationCodeExpiration = null;
    found.passwordRecoveryCode = null;
    await this.usersService.save(found);
  }

  async resendEmailConfirmation(email: string) {
    await this.handleRegistrationConfirmation(email);
  }

  async handleRegistrationConfirmation(email: string) {
    const code = await this.createRegistrationConfirmationCode(email);

    if (code) {
      try {
        await this.emailSender.sendEmailConfirmation(email, code);
      } catch (error: unknown) {
        this.logger.error(
          `Failed to send email confirmation to ${email}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }
  }

  async createPasswordRecoveryCode(email: string): Promise<string | null> {
    const found = await this.usersService.getByEmailNullable(email);
    if (found) {
      const code = crypto.randomUUID();
      found.passwordRecoveryCode = code;
      found.confirmationCodeExpiration = new Date(Date.now() + 1000 * 60 * 5);
      await this.usersService.save(found);
      return code;
    }

    return null;
  }

  async createRegistrationConfirmationCode(
    email: string,
  ): Promise<string | null> {
    const found = await this.usersService.getByEmailNullable(email);
    if (found) {
      const code = crypto.randomUUID();
      found.emailConfirmationCode = code;
      found.confirmationCodeExpiration = new Date(Date.now() + 1000 * 60 * 5);
      await this.usersService.save(found);
      return code;
    }

    return null;
  }
}
