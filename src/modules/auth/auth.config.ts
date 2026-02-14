import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ms } from 'ms';

@Injectable()
export class AuthConfig {
  skipPasswordCheck: boolean;
  jwtSecret: string;
  expiresIn: ms.StringValue;

  constructor(@Inject() private readonly configService: ConfigService) {
    this.skipPasswordCheck =
      this.configService.get<string>('SKIP_PASSWORD_CHECK') === 'true';
    this.jwtSecret = this.configService.get('JWT_SECRET') ?? 'secret';
    this.expiresIn = this.configService.get('JWT_EXPIRES_IN') ?? '15m';
  }
}
