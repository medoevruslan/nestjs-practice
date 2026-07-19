import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

type JwtUser = {
  id: string;
  email: string;
};

type OptionalAuthUser = Pick<JwtUser, 'id'>;

@Injectable()
export class OptionalAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
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

    return super.canActivate(context);
  }

  handleRequest<TUser = JwtUser>(error: unknown, user: unknown): TUser {
    if (error || !user) {
      this.throwUnauthorized();
    }

    // Preserve the old request.user shape instead of exposing email as well.
    return { id: (user as JwtUser).id } as OptionalAuthUser as TUser;
  }

  private throwUnauthorized(): never {
    throw new DomainException({
      code: DomainExceptionCode.Unauthorized,
      message: 'Invalid credentials',
    });
  }
}
