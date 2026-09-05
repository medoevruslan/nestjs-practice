type DeviceAuthSessionViewSource = {
  ip: string;
  deviceName: string;
  deviceId: string;
  lastActiveAt: number | string;
};

export class DeviceAuthSessionViewDto {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;

  static mapToView(
    session: DeviceAuthSessionViewSource,
  ): DeviceAuthSessionViewDto {
    const dto = new DeviceAuthSessionViewDto();

    dto.deviceId = session.deviceId;
    dto.ip = session.ip;
    dto.lastActiveDate = new Date(Number(session.lastActiveAt)).toISOString();
    dto.title = session.deviceName;

    return dto;
  }
}
