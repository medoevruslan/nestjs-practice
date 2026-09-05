import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';
import { SecurityController } from './api/security.controller';
import { DeviceAuthSessionQueryRepository } from './infrastructure/query/device-auth-session.query-repository';
import { CreateDeviceAuthSessionUseCase } from './application/usecases/create-device-auth-session.usecase';
import { UserAccountModule } from '../user-account/user-account.module';
import { DeviceAuthSessionRepository } from './infrastructure/device-auth-session.repository';
import { DeleteAllSessionsExceptCurrentUseCase } from './application/usecases/delete-all-sessions-except-current.usecase';
import { DeleteSessionByDeviceIdUseCase } from './application/usecases/delete-auth-session-by-id.usecase';
import { DeviceAuthSessionService } from './application/device-auth-session.service';
import { UpdateDeviceAuthSessionUseCase } from './application/usecases/update-device-auth-session.usecase';
import { DeviceAuthGuard } from './api/guards/device-auth.guard';

@Module({
  imports: [CqrsModule, UserAccountModule],
  controllers: [SecurityController],
  providers: [
    DeviceAuthSessionQueryRepository,
    DeviceAuthSessionRepository,
    CreateDeviceAuthSessionUseCase,
    DeleteAllSessionsExceptCurrentUseCase,
    DeleteSessionByDeviceIdUseCase,
    UpdateDeviceAuthSessionUseCase,
    DeviceAuthSessionService,
    DeviceAuthGuard,
  ],
  exports: [CreateDeviceAuthSessionUseCase, DeviceAuthSessionService],
})
export class SecurityModule {}
