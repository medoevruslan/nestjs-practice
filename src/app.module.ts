import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommentsController } from './comments/comments.controller';
import { CommentsQueryRepository } from './comments/commentsQuery.repository';

@Module({
  imports: [],
  controllers: [AppController, CommentsController],
  providers: [AppService, CommentsQueryRepository],
})
export class AppModule {}
