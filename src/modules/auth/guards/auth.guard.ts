import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.headers['authorization'];

    if (!accessToken) {
      return false;
    }

    const [bearer, token] = accessToken.split(' ');

    return true;
  }
}
