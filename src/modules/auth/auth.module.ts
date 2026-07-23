import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './api/auth.controller';
import { AuthService } from './application/auth.service';
import { CryptoService } from '../user-account/application/crypto-service';
import { AuthConfig } from './auth.config';
import { UserAccountModule } from '../user-account/user-account.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailerConfig } from './mailer.config';
import { AbstractEmailSender } from './application/port/abstract-email-sender';
import { MailerEmailSender } from './infrastructure/mailer-email-sender';
import { CqrsModule } from '@nestjs/cqrs';
import { RegisterUserUseCase } from './application/usecases/register-user.usecase';
import { UserRegisteredHandler } from './application/events/user-registered.handler';
import { LoginUserUseCase } from './application/usecases/login-user.usecase';
import { RecoveryPasswordUseCase } from './application/usecases/recovery-password.usecase';
import { SentRecoveryPasswordHandler } from './application/events/sent-recovery-password.handler';
import { ConfirmRegistrationUseCase } from './application/usecases/confirm-registration.usecase';
import { ResentConfirmationEmailHandler } from './application/events/resent-confirmation-email.handler';
import { ResendConfirmationEmailUseCase } from './application/usecases/resend-confirmation-email.usecase';
import { NewPasswordUseCase } from './application/usecases/new-password.usecase';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { BasicStrategy } from './strategies/basic.strategy';
import { ThrottlerModule } from '@nestjs/throttler';
import { RateLimitConfig } from './rate-limit.config';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({ useClass: RateLimitConfig }),
    JwtModule.registerAsync({ global: true, useClass: AuthConfig }),
    MailerModule.forRootAsync({ useClass: MailerConfig }),
    CqrsModule,
    UserAccountModule,
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    BasicStrategy,
    AuthService,
    CryptoService,
    AuthConfig,
    MailerConfig,
    MailerEmailSender,
    RecoveryPasswordUseCase,
    ConfirmRegistrationUseCase,
    ResendConfirmationEmailUseCase,
    RegisterUserUseCase,
    NewPasswordUseCase,
    LoginUserUseCase,
    UserRegisteredHandler,
    SentRecoveryPasswordHandler,
    ResentConfirmationEmailHandler,
    { provide: AbstractEmailSender, useClass: MailerEmailSender },
  ],
  exports: [AuthConfig, MailerConfig, JwtModule],
})
export class AuthModule {}
