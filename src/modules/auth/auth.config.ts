import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthConfig {
  skipPasswordCheck: boolean;

  constructor(@Inject() private readonly configService: ConfigService) {
    this.skipPasswordCheck =
      this.configService.get<string>('SKIP_PASSWORD_CHECK') === 'true';
  }
}
