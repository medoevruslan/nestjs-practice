import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { AuthConfig } from '../auth.config';
import { JwtUserPayload } from '../jwtUserPayload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject() private readonly authConfig: AuthConfig) {
    const jwtConfig = authConfig.getJwtConfig();

    if (typeof jwtConfig.secret !== 'string')
      throw new Error('Invalid JWT secret');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  async validate(payload: JwtUserPayload) {
    return { id: payload.id, email: payload.email };
  }
}
