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
} from '@nestjs/common';
import {
  CreatePostInputDto,
  UpdatePostInputDto,
} from './input-dto/post.input-dto';
import { GetPostsQueryParams } from './input-dto/get-posts.query-params.input-dto';
import { PostsQueryRepository } from '../infrastructure/query/posts.query-repository';
import { PostsService } from '../application/posts.service';
import { ApiParam } from '@nestjs/swagger';
import { ParseObjectIdOrBadRequestPipe } from '../../../../core/pipes/ParseObjectIdOrBadRequestPipe';
import { CommentsQueryRepository } from '../../comments/infrastructure/query/comments-query.repository';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/usecases/create-post.usecase';
import { UpdatePostCommand } from '../application/usecases/update-post.usecase';

@Controller('posts')
export class PostsController {
  constructor(
    @Inject(PostsQueryRepository)
    private postsQueryRepository: PostsQueryRepository,
    @Inject(CommentsQueryRepository)
    private commentsQueryRepository: CommentsQueryRepository,
    @Inject(PostsService)
    private postsService: PostsService,
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
  @Get(':postId/comments')
  async getPostComments(
    @Param('postId', ParseObjectIdOrBadRequestPipe) postId: string,
  ) {
    return this.commentsQueryRepository.getCommentsByPostIdOrFail(
      postId,
      'dummyId',
    );
  }

  @Post()
  async createPost(@Body() dto: CreatePostInputDto) {
    const postId = await this.commandBus.execute<CreatePostCommand, string>(
      new CreatePostCommand(dto),
    );
    return this.postsQueryRepository.getPostByIdOrFail(postId, 'dummyId');
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updatePost(
    @Param('id', ParseObjectIdOrBadRequestPipe) id: string,
    @Body() dto: UpdatePostInputDto,
  ) {
    return this.commandBus.execute<UpdatePostCommand>(
      new UpdatePostCommand(id, dto),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deletePost(@Param('id', ParseObjectIdOrBadRequestPipe) id: string) {
    return this.postsService.deletePost(id);
  }
}
