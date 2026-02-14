import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user-account/domain/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './api/auth.controller';
import { AuthService } from './application/auth.service';
import { UsersRepository } from '../user-account/infrastructure/users.repository';
import { CryptoService } from '../user-account/application/crypto-service';
import { AuthConfig } from './auth.config';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'undefined',
      signOptions: { expiresIn: '15m' },
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersRepository, CryptoService, AuthConfig],
})
export class AuthModule {}
