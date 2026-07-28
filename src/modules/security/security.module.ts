import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';
import { SecurityController } from './api/security.controller';
import { DeviceAuthSessionQueryRepository } from '../auth/infrastructure/query/device-auth-session.query-repository';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DeviceAuthSession,
  DeviceAuthSessionSchema,
} from './domain/device-auth-session.entity';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: DeviceAuthSession.name, schema: DeviceAuthSessionSchema },
    ]),
  ],
  controllers: [SecurityController],
  providers: [DeviceAuthSessionQueryRepository],
  exports: [],
})
export class SecurityModule {}
