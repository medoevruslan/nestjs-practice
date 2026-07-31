import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';
import { IsBoolean } from 'class-validator';
import { IsStringWithTrim } from 'src/core/decorators/validation/is-string-with-trim';
import { IsMsDuration } from 'src/core/decorators/validation/is-ms-duration';

@Injectable()
export class AuthConfig implements JwtOptionsFactory {
  @IsBoolean()
  skipPasswordCheck: boolean =
    this.configService.get<string>('SKIP_PASSWORD_CHECK') === 'true';

  @IsStringWithTrim(4)
  jwtSecret: string = String(this.configService.get('JWT_SECRET'));

  @IsMsDuration()
  accessTokenExpiresIn: ms.StringValue = this.configService.get<ms.StringValue>(
    'JWT_ACCESS_EXPIRES_IN',
  ) as ms.StringValue;

  @IsMsDuration()
  refreshTokenExpiresIn: ms.StringValue =
    this.configService.get<ms.StringValue>(
      'JWT_REFRESH_EXPIRES_IN',
    ) as ms.StringValue;

  @IsStringWithTrim(1)
  adminName: string = String(this.configService.get<string>('ADMIN_NAME'));

  @IsStringWithTrim(4)
  adminPassword: string = String(this.configService.get('ADMIN_PASSWORD'));

  constructor(private readonly configService: ConfigService) {}

  getJwtConfig() {
    return {
      secret: this.jwtSecret,
      accessTokenExpiresIn: this.accessTokenExpiresIn,
      refreshTokenExpiresIn: this.refreshTokenExpiresIn,
    };
  }

  getAdminCredentials() {
    return {
      name: this.adminName,
      password: this.adminPassword,
    };
  }

  createJwtOptions(): JwtModuleOptions {
    return {
      secret: this.jwtSecret,
      signOptions: { expiresIn: this.accessTokenExpiresIn },
    };
  }
}
