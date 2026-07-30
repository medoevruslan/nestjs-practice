import { DeviceAuthSessionDocument } from '../../domain/device-auth-session.entity';

export class DeviceAuthSessionViewDto {
  readonly ip: string;
  readonly title: string;
  readonly lastActiveDate: string;
  readonly deviceId: string;

  static mapToView(dto: DeviceAuthSessionDocument): DeviceAuthSessionViewDto {
    return {
      ip: dto.ip,
      title: dto.deviceName,
      deviceId: dto.deviceId,
      lastActiveDate: new Date(dto.iat * 1000).toISOString(),
    };
  }
}
