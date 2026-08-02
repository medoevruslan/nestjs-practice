import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DeviceAuthSessionQueryRepository } from '../infrastructure/query/device-auth-session.query-repository';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteAllSessionsExceptCurrentCommand } from '../application/usecases/delete-all-sessions-except-current.usecase';
import { DeleteSessionByDeviceIdCommand } from '../application/usecases/delete-auth-session-by-id.usecase';

@UseGuards(JwtAuthGuard)
@Controller('security')
export class SecurityController {
  constructor(
    @Inject()
    private readonly deviceAuthSessionQueryRepository: DeviceAuthSessionQueryRepository,
    @Inject() private readonly commandBus: CommandBus,
  ) {}

  @Get('devices')
  async getAll() {
    return this.deviceAuthSessionQueryRepository.getAll();
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('devices')
  async deleteAll() {
    await this.commandBus.execute<DeleteAllSessionsExceptCurrentCommand>(
      new DeleteAllSessionsExceptCurrentCommand(),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('devices/:deviceId')
  async deleteSessionById(@Param('deviceId') deviceId: string) {
    await this.commandBus.execute<DeleteSessionByDeviceIdCommand>(
      new DeleteSessionByDeviceIdCommand(deviceId),
    );
  }
}
