import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  CreatePostInputDto,
  UpdatePostInputDto,
} from './input-dto/post.input-dto';
import { GetPostsQueryParams } from './input-dto/get-posts.query-params.input-dto';
import { PostsQueryRepository } from '../infrastructure/query/posts.query-repository';
import { ApiParam } from '@nestjs/swagger';
import { ParseObjectIdOrBadRequestPipe } from '../../../../core/pipes/ParseObjectIdOrBadRequestPipe';
import { CommentsQueryRepository } from '../../comments/infrastructure/query/comments-query.repository';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/usecases/create-post.usecase';
import { UpdatePostCommand } from '../application/usecases/update-post.usecase';
import { DeletePostCommand } from '../application/usecases/delete-post.usecase';
import { CommentInputDto } from '../../shared/api/input-dto/comment.input-dto';
import { CreateCommentCommand } from '../../comments/application/usecases/create-comment.usecase';
import { CreateCommentDto } from '../../comments/dto/create-comment.dto';
import { LikeStatusInputDto } from '../../likes/api/input-dto/like-status.input-dto';
import { UpdateLikeStatusCommand } from '../../likes/application/usecases/update-like-status.usecase';
import { BasicAuthGuard } from '../../../auth/guards/basic-auth.guard';
import { OptionalAuthGuard } from '../../../auth/guards/optional-auth.guard';
import { GetCommentsQueryParams } from '../../comments/api/input-dto/get-comments.query-params.input-dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { CurrentUserId } from 'src/core/decorators/auth/create-param.decorator';

@Controller('posts')
export class PostsController {
  constructor(
    @Inject(PostsQueryRepository)
    private postsQueryRepository: PostsQueryRepository,
    @Inject(CommentsQueryRepository)
    private commentsQueryRepository: CommentsQueryRepository,
    @Inject() private readonly commandBus: CommandBus,
  ) { }

  @Get()
  @UseGuards(OptionalAuthGuard)
  async getAll(
    @Query() query: GetPostsQueryParams,
    @CurrentUserId() userId: string
  ) {
    return this.postsQueryRepository.getAll(query, userId);
  }

  @ApiParam({ name: 'id' })
  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  async getPostById(
    @Param('id', ParseObjectIdOrBadRequestPipe) id: string,
    @CurrentUserId() userId: string
  ) {
    return this.postsQueryRepository.getPostByIdOrFail(id, userId);
  }

  @ApiParam({ name: 'postId' })
  @UseGuards(JwtAuthGuard)
  @Put(':postId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatus(
    @Param('postId', ParseObjectIdOrBadRequestPipe) postId: string,
    @Body() dto: LikeStatusInputDto,
    @CurrentUserId() userId: string
  ) {
    await this.commandBus.execute(
      new UpdateLikeStatusCommand(postId, 'Post', userId, dto.likeStatus),
    );
  }

  @ApiParam({ name: 'postId' })
  @Get(':postId/comments')
  @UseGuards(OptionalAuthGuard)
  async getPostComments(
    @Param('postId', ParseObjectIdOrBadRequestPipe) postId: string,
    @Query() query: GetCommentsQueryParams,
    @CurrentUserId() userId: string
  ) {
    return this.commentsQueryRepository.getCommentsByPostIdOrFail(
      postId,
      userId,
      query,
    );
  }

  @ApiParam({ name: 'postId' })
  @Post(':postId/comments')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPostComment(
    @Param('postId', ParseObjectIdOrBadRequestPipe) postId: string,
    @Body() dto: CommentInputDto,
    @CurrentUserId() userId: string,
  ) {
    const payload: CreateCommentDto = Object.assign(
      { userId, postId: postId },
      dto,
    );
    const commentId = await this.commandBus.execute<
      CreateCommentCommand,
      string
    >(new CreateCommentCommand(payload));
    return this.commentsQueryRepository.getCommentByIdOrFail(commentId, userId);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createPost(@Body() dto: CreatePostInputDto) {
    const postId = await this.commandBus.execute<CreatePostCommand, string>(
      new CreatePostCommand(dto),
    );
    return this.postsQueryRepository.getPostByIdOrFail(postId, 'dummyId');
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id', ParseObjectIdOrBadRequestPipe) id: string,
    @Body() dto: UpdatePostInputDto,
  ) {
    return this.commandBus.execute<UpdatePostCommand>(
      new UpdatePostCommand(id, dto),
    );
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id', ParseObjectIdOrBadRequestPipe) id: string) {
    return this.commandBus.execute<DeletePostCommand>(
      new DeletePostCommand(id),
    );
  }
}
