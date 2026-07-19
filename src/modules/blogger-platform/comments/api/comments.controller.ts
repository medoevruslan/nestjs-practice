import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentsQueryRepository } from '../infrastructure/query/comments-query.repository';
import { ParseObjectIdOrBadRequestPipe } from '../../../../core/pipes/ParseObjectIdOrBadRequestPipe';
import { AuthGuard } from '../../../auth/guards/auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CommentInputDto } from '../../shared/api/input-dto/comment.input-dto';
import { UpdateCommentCommand } from '../application/usecases/update-comment.usecase';
import { DeleteCommentCommand } from '../application/usecases/delete-comment.usecase';
import { LikeStatusInputDto } from '../../likes/api/input-dto/like-status.input-dto';
import { UpdateLikeStatusCommand } from '../../likes/application/usecases/update-like-status.usecase';
import { OptionalAuthGuard } from '../../../auth/guards/optional-auth.guard';

type AuthorizedRequest = Request & { user: { id: string } };
type OptionalAuthorizedRequest = Request & { user?: { id: string } };

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  getCommentById(
    @Param('id', ParseObjectIdOrBadRequestPipe) id: string,
    @Req() req: OptionalAuthorizedRequest,
  ) {
    return this.commentsQueryRepository.getCommentByIdOrFail(
      id,
      req.user?.id ?? '',
    );
  }

  @Put(':commentId/like-status')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatus(
    @Param('commentId', ParseObjectIdOrBadRequestPipe) commentId: string,
    @Body() dto: LikeStatusInputDto,
    @Req() req: AuthorizedRequest,
  ) {
    await this.commandBus.execute(
      new UpdateLikeStatusCommand(
        commentId,
        'Comment',
        req.user.id,
        dto.likeStatus,
      ),
    );
  }

  @Put(':commentId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Param('commentId', ParseObjectIdOrBadRequestPipe) commentId: string,
    @Body() dto: CommentInputDto,
    @Req() req: AuthorizedRequest,
  ) {
    await this.commandBus.execute(
      new UpdateCommentCommand(commentId, req.user.id, dto.content),
    );
  }

  @Delete(':commentId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('commentId', ParseObjectIdOrBadRequestPipe) commentId: string,
    @Req() req: AuthorizedRequest,
  ) {
    await this.commandBus.execute(
      new DeleteCommentCommand(commentId, req.user.id),
    );
  }
}
