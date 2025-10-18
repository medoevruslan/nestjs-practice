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

@Controller('posts')
export class PostsController {
  constructor(
    @Inject(PostsQueryRepository)
    private postsQueryRepository: PostsQueryRepository,
    @Inject(PostsService)
    private postsService: PostsService,
  ) {}

  @Get()
  getAll(@Query() query: GetPostsQueryParams) {
    return this.postsQueryRepository.getAll(query, 'dummyId');
  }

  @ApiParam({ name: 'id' })
  @Get(':id')
  getPostById(@Param('id', ParseObjectIdOrBadRequestPipe) id: string) {
    return this.postsQueryRepository.getPostByIdOrFail(id, 'dummyId');
  }

  @Post()
  createPost(@Body() dto: CreatePostInputDto) {
    return this.postsService.createPost(dto);
  }

  @Put(':id')
  updatePost(
    @Param('id', ParseObjectIdOrBadRequestPipe) id: string,
    @Body() dto: UpdatePostInputDto,
  ) {
    return this.postsService.updatePost(id, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deletePost(@Param('id', ParseObjectIdOrBadRequestPipe) id: string) {
    return this.postsService.deletePost(id);
  }
}
