import { IsNumber } from 'class-validator';
import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';

export class UpdateDeviceAuthSessionDto {
  @IsStringWithTrim(1)
  sessionId: string;

  @IsNumber()
  iat: number;

  @IsStringWithTrim(4)
  deviceId: string;

  @IsStringWithTrim(60, 60)
  currentRefreshTokenHash: string;

  @IsStringWithTrim(1)
  userId: string;

  @IsNumber()
  exp: number;

  @IsStringWithTrim(60, 60)
  refreshTokenHash: string;

  @IsNumber()
  lastActiveAt: number;
}
