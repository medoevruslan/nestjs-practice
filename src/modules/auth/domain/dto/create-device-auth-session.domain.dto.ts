import { IsNumber } from 'class-validator';
import { IsStringWithTrim } from '../../../../core/decorators/validation/is-string-with-trim';

export class CreateDeviceAuthSessionDomainDto {
  @IsNumber()
  iat: number;

  @IsStringWithTrim(4)
  deviceId: string;

  @IsStringWithTrim(7, 39)
  ip: string;

  @IsStringWithTrim(2)
  deviceName: string;

  @IsStringWithTrim(1)
  userId: string;

  @IsNumber()
  exp: number;
}
