import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { AuthConfig } from '../auth.config';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authConfig: AuthConfig) {
    super();
  }

  validate(username: string, password: string) {
    const name = this.authConfig.adminName;
    const passw = this.authConfig.adminPassword;

    if (name === username && passw === password) return true;
    this.throwUnauthorized();
  }

  private throwUnauthorized(): never {
    throw new DomainException({
      code: DomainExceptionCode.Unauthorized,
      message: 'Invalid credentials',
    });
  }
}
