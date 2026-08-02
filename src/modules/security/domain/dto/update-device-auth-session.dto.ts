import { IsMongoId, IsNumber } from 'class-validator';
import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';
import { Types } from 'mongoose';

export class UpdateDeviceAuthSessionDto {
  @IsMongoId()
  sessionId: Types.ObjectId;

  @IsNumber()
  iat: number;

  @IsStringWithTrim(4)
  deviceId: string;

  @IsStringWithTrim(60, 60)
  currentRefreshTokenHash: string;

  @IsMongoId()
  userId: Types.ObjectId;

  @IsNumber()
  exp: number;

  @IsStringWithTrim(60, 60)
  refreshTokenHash: string;

  @IsNumber()
  lastActiveAt: number;
}
