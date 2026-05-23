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
import { BlogsService } from '../application/blogs.service';
import { BlogsQueryRepository } from '../infrastructure/query/blogs.query-repository';
import { ApiParam } from '@nestjs/swagger';
import {
  CreateBlogInputDto,
  CreatePostByBlogIdInputDto,
  UpdateBlogInputDto,
} from './input-dto/blog.input-dto';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params-input.dto';
import { ParseObjectIdOrBadRequestPipe } from '../../../../core/pipes/ParseObjectIdOrBadRequestPipe';
import { PostsQueryRepository } from '../../posts/infrastructure/query/posts.query-repository';
import { PostsService } from '../../posts/application/posts.service';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts.query-params.input-dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../application/usecases/create-blog.usecase';
import { CreatePostByBlogIdCommand } from '../application/usecases/create-post-by-blog-id.usecase';

@Controller('blogs')
export class BlogsController {
  constructor(
    @Inject()
    private readonly blogsQueryRepository: BlogsQueryRepository,
    @Inject()
    private readonly postsQueryRepository: PostsQueryRepository,
    @Inject()
    private readonly postsService: PostsService,
    @Inject() private readonly blogsService: BlogsService,
    @Inject() private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async getAll(@Query() query: GetBlogsQueryParams) {
    return this.blogsQueryRepository.getAll(query);
  }

  @Post()
  async createBlog(@Body() body: CreateBlogInputDto) {
    const blogId = await this.commandBus.execute<CreateBlogCommand, string>(
      new CreateBlogCommand(body),
    );
    return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @ApiParam({ name: 'id' }) // for swagger
  @Get(':id')
  async getBlogById(@Param('id', ParseObjectIdOrBadRequestPipe) id: string) {
    return this.blogsQueryRepository.getByIdOrNotFoundFail(id);
  }

  @ApiParam({ name: 'blogId' }) // for swagger
  @Get(':blogId/posts')
  async getPostByBlogId(
    @Param('blogId', ParseObjectIdOrBadRequestPipe) blogId: string,
    @Query() query: GetPostsQueryParams,
  ) {
    return this.postsQueryRepository.getPostByBlogIdOrFail(
      blogId,
      'dummyId',
      query,
    );
  }

  @ApiParam({ name: 'blogId' }) // for swagger
  @Post(':blogId/posts')
  async createPostByBlogId(
    @Param('blogId', ParseObjectIdOrBadRequestPipe) blogId: string,
    @Body() dto: CreatePostByBlogIdInputDto,
  ) {
    const postId = await this.commandBus.execute(
      new CreatePostByBlogIdCommand({ ...dto, blogId: blogId }),
    );
    return this.postsQueryRepository.getPostByIdOrFail(postId, 'dummyId');
  }

  @ApiParam({ name: 'id' })
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id', ParseObjectIdOrBadRequestPipe) id: string,
    @Body() dto: UpdateBlogInputDto,
  ) {
    const blogId = await this.blogsService.updateBlog(id, dto);
    return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @ApiParam({ name: 'id' }) // for swagger
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id', ParseObjectIdOrBadRequestPipe) id: string) {
    return this.blogsService.deleteById(id);
  }
}
