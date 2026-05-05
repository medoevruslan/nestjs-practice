import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers['authorization'];

    if (!authorization) {
      this.throwUnauthorized();
    }

    const [authType, credentials] = authorization.split(' ');

    if (authType !== 'Basic' || !credentials) {
      this.throwUnauthorized();
    }

    const decodedCredentials = Buffer.from(credentials, 'base64').toString(
      'utf8',
    );

    if (decodedCredentials !== 'admin:qwerty') {
      this.throwUnauthorized();
    }

    return true;
  }

  private throwUnauthorized(): never {
    throw new DomainException({
      code: DomainExceptionCode.Unauthorized,
      message: 'Invalid credentials',
    });
  }
}
