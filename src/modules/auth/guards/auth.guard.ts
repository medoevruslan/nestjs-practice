import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject() private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.headers['authorization'];

    if (!accessToken) {
      return false;
    }

    const [bearer, token] = accessToken.split(' ');

    if (bearer !== 'Bearer' || !token) {
      return false;
    }

    const payload = this.jwtService.verify<{ email: string; id: string }>(
      token,
    );

    if (!payload) {
      return false;
    }

    request.user = { id: payload.id };

    return true;
  }
}
