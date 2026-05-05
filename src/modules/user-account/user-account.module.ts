import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { UsersController } from './api/users.controller';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { UsersRepository } from './infrastructure/users.repository';
import { UsersService } from './application/users.service';
import { CryptoService } from './application/crypto-service';
import { JwtModule } from '@nestjs/jwt';
import { AuthConfig } from '../auth/auth.config';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({ useClass: AuthConfig }),
  ],
  controllers: [UsersController],
  providers: [
    UsersQueryRepository,
    UsersRepository,
    UsersService,
    CryptoService,
    BasicAuthGuard,
  ],
  exports: [UsersService],
})
export class UserAccountModule {}
