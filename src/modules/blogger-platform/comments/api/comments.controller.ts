import { Controller, Get, Param } from '@nestjs/common';
import { CommentsQueryRepository } from './commentsQuery.repository';

@Controller('comments')
export class CommentsController {
  constructor(private commentsQueryRepository: CommentsQueryRepository) {}

  @Get(':id')
  getCommentById(@Param('id') id: string) {
    return this.commentsQueryRepository.findById(id, 'unknown');
  }
}
