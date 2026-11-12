import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersService } from './application/users.service';
import { CryptoService } from './application/crypto-service';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { CreateUserUseCase } from './application/usecases/create-user.usecase';
import { CqrsModule } from '@nestjs/cqrs';
import { DeleteUserUseCase } from './application/usecases/delete-user.usecase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/user.entity';
import { DeviceAuthSession } from '../security/domain/device-auth-session.entity';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([User, DeviceAuthSession])],
  controllers: [UsersController],
  providers: [
    UsersQueryRepository,
    UsersRepository,
    UsersService,
    CryptoService,
    BasicAuthGuard,
    CreateUserUseCase,
    DeleteUserUseCase,
  ],
  exports: [UsersService],
})
export class UserAccountModule {}
