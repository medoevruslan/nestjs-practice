import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BloggerPlatformModule } from './modules/blogger-platform/blogger-platform.module';

@Module({
  imports: [BloggerPlatformModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
