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

@Module({
  imports: [
    JwtModule.registerAsync({ useClass: AuthConfig }),
    MailerModule.forRootAsync({ useClass: MailerConfig }),
    CqrsModule,
    UserAccountModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    CryptoService,
    AuthConfig,
    MailerConfig,
    MailerEmailSender,
    RegisterUserUseCase,
    UserRegisteredHandler,
    { provide: AbstractEmailSender, useClass: MailerEmailSender },
  ],
  exports: [AuthConfig, MailerConfig],
})
export class AuthModule {}
