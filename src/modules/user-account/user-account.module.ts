import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { UsersController } from './api/users.controller';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersService } from './application/users.service';
import { CryptoService } from './application/crypto-service';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { CreateUserUseCase } from './application/usecases/create-user.usecase';
import { CqrsModule } from '@nestjs/cqrs';
import { DeleteUserUseCase } from './application/usecases/delete-user.usecase';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
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
export class UserAccountModule { }
