import { DeviceAuthSessionDocument } from '../../domain/device-auth-session.entity';

export class DeviceAuthSessionViewDto {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;

  static mapToView(
    session: DeviceAuthSessionDocument,
  ): DeviceAuthSessionViewDto {
    const dto = new DeviceAuthSessionViewDto();

    dto.deviceId = session.deviceId;
    dto.ip = session.ip;
    dto.lastActiveDate = new Date(session.lastActiveAt!).toISOString();
    dto.title = session.deviceName;

    return dto;
  }
}
