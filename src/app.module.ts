import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BloggerPlatformModule } from './modules/blogger-platform/blogger-platform.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountModule } from './modules/user-account/user-account.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nest-bloggers-platform'),
    BloggerPlatformModule,
    UserAccountModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
