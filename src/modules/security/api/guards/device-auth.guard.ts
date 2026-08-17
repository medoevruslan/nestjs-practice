import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtUserPayload } from '../../../auth/jwtUserPayload';
import { DeviceAuthSessionService } from '../../application/device-auth-session.service';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

@Injectable()
export class DeviceAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly deviceAuthSessionService: DeviceAuthSessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const bearerToken = this.getBearerToken(request);

    if (bearerToken) {
      return this.authorizeByToken(request, bearerToken);
    }

    const refreshToken = request.cookies?.refreshToken;

    if (!refreshToken) {
      this.throwUnAuth();
    }

    return this.authorizeByToken(request, refreshToken, true);
  }

  private async authorizeByToken(
    request: Request,
    token: string,
    shouldValidateSession = false,
  ) {
    try {
      const payload = this.jwtService.verify<JwtUserPayload>(token);

      if (shouldValidateSession) {
        await this.deviceAuthSessionService.validateRefreshTokenForSession(
          payload.deviceId,
          token,
        );
      }

      request.user = {
        id: payload.id,
        email: payload.email,
        deviceId: payload.deviceId,
      };

      return true;
    } catch {
      return this.throwUnAuth();
    }
  }

  private getBearerToken(request: Request) {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');

    return type === 'Bearer' && token ? token : null;
  }

  private throwUnAuth(): boolean {
    throw new DomainException({
      code: DomainExceptionCode.Unauthorized,
      message: 'Invalid auth data',
    });
  }
}
