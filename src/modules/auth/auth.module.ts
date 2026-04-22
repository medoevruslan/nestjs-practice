import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './api/auth.controller';
import { AuthService } from './application/auth.service';
import { CryptoService } from '../user-account/application/crypto-service';
import { AuthConfig } from './auth.config';
import { UserAccountModule } from '../user-account/user-account.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [AuthModule],
      inject: [AuthConfig],
      useFactory: (authConfig: AuthConfig) => ({
        secret: authConfig.jwtSecret,
        signOptions: { expiresIn: authConfig.expiresIn },
      }),
    }),
    UserAccountModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, CryptoService, AuthConfig],
  exports: [AuthConfig],
})
export class AuthModule {}
