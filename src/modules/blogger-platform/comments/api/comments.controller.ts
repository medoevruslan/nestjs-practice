import { Controller, Get, Param } from '@nestjs/common';
import { CommentsQueryRepository } from '../infrastructure/query/comments-query.repository';
import { ParseObjectIdOrBadRequestPipe } from '../../../../core/pipes/ParseObjectIdOrBadRequestPipe';

@Controller('comments')
export class CommentsController {
  constructor(private commentsQueryRepository: CommentsQueryRepository) {}

  @Get(':id')
  getCommentById(@Param('id', ParseObjectIdOrBadRequestPipe) id: string) {
    return this.commentsQueryRepository.getCommentByIdOrFail(id, 'unknown');
  }
}
