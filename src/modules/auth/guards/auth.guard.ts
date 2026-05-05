import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DomainException } from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject() private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.headers['authorization'];

    if (!accessToken) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'No access token provided',
      });
    }

    const [bearer, token] = accessToken.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid access token provided',
      });
    }

    try {
      const payload = this.jwtService.verify<{ email: string; id: string }>(
        token,
      );

      if (!payload) {
        return false;
      }

      request.user = { id: payload.id };
      return true;
    } catch (error) {
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid access token provided',
      });
    }
  }
}
