import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';

@Injectable()
export class AuthConfig implements JwtOptionsFactory {
  skipPasswordCheck: boolean;
  jwtSecret: string;
  expiresIn: ms.StringValue;

  constructor(@Inject() private readonly configService: ConfigService) {
    this.skipPasswordCheck =
      this.configService.get<string>('SKIP_PASSWORD_CHECK') === 'true';
    this.jwtSecret = this.configService.get('JWT_SECRET') ?? 'secret';
    this.expiresIn = this.configService.get('JWT_EXPIRES_IN') ?? '15m';
  }

  createJwtOptions(): JwtModuleOptions {
    return {
      secret: this.jwtSecret,
      signOptions: { expiresIn: this.expiresIn },
    };
  }
}
