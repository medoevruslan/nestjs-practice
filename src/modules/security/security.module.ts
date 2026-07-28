import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';
import { SecurityController } from './api/security.controller';
import { DeviceAuthSessionQueryRepository } from './infrastructure/query/device-auth-session.query-repository';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DeviceAuthSession,
  DeviceAuthSessionSchema,
} from './domain/device-auth-session.entity';
import { CreateDeviceAuthSessionUseCase } from './application/usecases/create-device-auth-session.usecase';
import { UserAccountModule } from '../user-account/user-account.module';
import { DeviceAuthSessionRepository } from './infrastructure/device-auth-session.repository';

@Module({
  imports: [
    CqrsModule,
    UserAccountModule,
    MongooseModule.forFeature([
      { name: DeviceAuthSession.name, schema: DeviceAuthSessionSchema },
    ]),
  ],
  controllers: [SecurityController],
  providers: [
    DeviceAuthSessionQueryRepository,
    DeviceAuthSessionRepository,
    CreateDeviceAuthSessionUseCase,
  ],
  exports: [CreateDeviceAuthSessionUseCase],
})
export class SecurityModule { }
