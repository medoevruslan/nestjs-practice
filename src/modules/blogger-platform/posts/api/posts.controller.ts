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
  Req,
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
import { AuthGuard } from 'src/modules/auth/guards/auth.guard';
import { CreateCommentDto } from '../../comments/dto/create-comment.dto';
import { LikeStatusInputDto } from '../../likes/api/input-dto/like-status.input-dto';
import { UpdateLikeStatusCommand } from '../../likes/application/usecases/update-like-status.usecase';
import { BasicAuthGuard } from '../../../auth/guards/basic-auth.guard';

type AuthorizedRequest = Request & { user: { id: string } };

@Controller('posts')
export class PostsController {
  constructor(
    @Inject(PostsQueryRepository)
    private postsQueryRepository: PostsQueryRepository,
    @Inject(CommentsQueryRepository)
    private commentsQueryRepository: CommentsQueryRepository,
    @Inject() private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async getAll(@Query() query: GetPostsQueryParams) {
    return this.postsQueryRepository.getAll(query, 'dummyId');
  }

  @ApiParam({ name: 'id' })
  @Get(':id')
  async getPostById(@Param('id', ParseObjectIdOrBadRequestPipe) id: string) {
    return this.postsQueryRepository.getPostByIdOrFail(id, 'dummyId');
  }

  @ApiParam({ name: 'postId' })
  @UseGuards(AuthGuard)
  @Put(':postId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateLikeStatus(
    @Param('postId', ParseObjectIdOrBadRequestPipe) postId: string,
    @Body() dto: LikeStatusInputDto,
    @Req() req: AuthorizedRequest,
  ) {
    await this.commandBus.execute(
      new UpdateLikeStatusCommand(postId, 'Post', req.user.id, dto.likeStatus),
    );
  }

  @ApiParam({ name: 'postId' })
  @Get(':postId/comments')
  async getPostComments(
    @Param('postId', ParseObjectIdOrBadRequestPipe) postId: string,
  ) {
    return this.commentsQueryRepository.getCommentsByPostIdOrFail(
      postId,
      'dummyId',
    );
  }

  @ApiParam({ name: 'postId' })
  @Post(':postId/comments')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createPostComment(
    @Param('postId', ParseObjectIdOrBadRequestPipe) postId: string,
    @Body() dto: CommentInputDto,
    @Req() req: AuthorizedRequest,
  ) {
    const userId = req.user.id;
    const payload: CreateCommentDto = Object.assign(
      { userId, postId: postId },
      dto,
    );
    await this.commandBus.execute<CreateCommentCommand, string>(
      new CreateCommentCommand(payload),
    );
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
