import {
  BadRequestException,
  Inject,
  Injectable,
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
import { EmailRecoveryInputDto } from '../api/input-dto/email.recovery.input-dto';
import { AbstractEmailSender } from './port/abstract-email-sender';

@Injectable()
export class AuthService {
  private readonly jswService: JwtService;

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
    const user = await this.usersService.getByEmail(dto.email);

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
    const found = await this.usersService.getByEmail(dto.email);
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

  async recoveryPassword(dto: EmailRecoveryInputDto) {
    try {
      const found = await this.usersService.getByEmail(dto.email);
      await this.emailSender.sendPasswordRecovery(found.email, dto.code);
    } catch (e: unknown) {}
  }

  async newPassword(dto: NewPasswordDto) {
    const found = await this.usersService.getByPasswordRecoveryCode(dto.code);

    if (
      found.confirmationCodeExpiration &&
      Date.now() > found.confirmationCodeExpiration?.getTime()
    ) {
      throw new BadRequestException('Code expired');
    }

    const hashedPassword = await this.cryptoService.hashPassword(dto.password);

    found.updatePassword({ password: hashedPassword });
  }
}
