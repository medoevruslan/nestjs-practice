import { configModule } from './dynamic-config-module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BloggerPlatformModule } from './modules/blogger-platform/blogger-platform.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountModule } from './modules/user-account/user-account.module';
import { TestingModule } from './modules/testing/testing.module';
import { CoreModule } from './core/core.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    configModule,
    MongooseModule.forRoot(process.env.MONGODB_URI ?? 'undefined'),
    BloggerPlatformModule,
    UserAccountModule,
    TestingModule,
    CoreModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
