import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import {
  DeviceAuthSession,
  DeviceAuthSessionModel,
} from '../../domain/device-auth-session.entity';
import { CreateDeviceAuthSessionDomainDto } from '../../domain/dto/create-device-auth-session.domain.dto';
import { Inject } from '@nestjs/common';
import { UsersService } from '../../../user-account/application/users.service';
import { DeviceAuthSessionRepository } from '../../infrastructure/device-auth-session.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class CreateDeviceAuthSessionCommand {
  constructor(public readonly dto: CreateDeviceAuthSessionDomainDto) {}
}

@CommandHandler(CreateDeviceAuthSessionCommand)
export class CreateDeviceAuthSessionUseCase implements ICommandHandler<CreateDeviceAuthSessionCommand> {
  constructor(
    @InjectModel(DeviceAuthSession.name)
    private readonly model: DeviceAuthSessionModel,
    @Inject()
    private readonly deviceAuthSessionRepository: DeviceAuthSessionRepository,
    @Inject() private readonly usersService: UsersService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async execute(command: CreateDeviceAuthSessionCommand) {
    await this.usersService.getByIdOrFailRaw(command.dto.userId.toString());
    const {
      ip,
      deviceId,
      deviceName,
      exp,
      iat,
      lastActiveAt,
      refreshTokenHash,
      userId,
    } = this.model.createInstance(command.dto);

    await this.dataSource.query(
      'INSERT INTO  "public.device_auth_session" (ip, device_name, device_id, exp, iat, refresh_token_hash, last_active_at, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [
        ip,
        deviceName,
        deviceId,
        exp,
        iat,
        refreshTokenHash,
        lastActiveAt,
        userId,
      ],
    );
    // await this.deviceAuthSessionRepository.save(instance);
  }
}
