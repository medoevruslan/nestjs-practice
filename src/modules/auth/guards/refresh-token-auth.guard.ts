import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtUserPayload } from '../jwtUserPayload';
import { DeviceAuthSessionService } from '../../security/application/device-auth-session.service';
import { DomainException } from 'src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from 'src/core/exceptions/domain-exception-codes';

@Injectable()
export class RefreshTokenAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly deviceAuthSessionService: DeviceAuthSessionService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const refreshToken = request.cookies?.refreshToken;

    if (!refreshToken) {
      return this.throwUnAuth();
    }

    try {
      const payload = this.jwtService.verify<JwtUserPayload>(refreshToken);

      await this.deviceAuthSessionService.validateRefreshTokenForSession(
        payload.deviceId,
        refreshToken,
      );

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

  private throwUnAuth(): boolean {
    throw new DomainException({
      code: DomainExceptionCode.Unauthorized,
      message: 'Invalid auth data',
    });
  }
}
