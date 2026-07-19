import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;

    if (!authorization) {
      return true;
    }

    const [type, token] = authorization.split(' ');
    if (type !== 'Bearer') {
      return true;
    }

    if (!token) {
      this.throwUnauthorized();
    }

    try {
      const payload = this.jwtService.verify<{ id: string }>(token);
      request.user = { id: payload.id };
      return true;
    } catch {
      this.throwUnauthorized();
    }
  }

  private throwUnauthorized(): never {
    throw new DomainException({
      code: DomainExceptionCode.Unauthorized,
      message: 'Invalid credentials',
    });
  }
}
