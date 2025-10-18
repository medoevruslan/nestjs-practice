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

@Controller('blogs')
export class BlogsController {
  constructor(
    @Inject(BlogsQueryRepository)
    private blogsQueryRepository: BlogsQueryRepository,
    @Inject(PostsQueryRepository)
    private postsQueryRepository: PostsQueryRepository,
    @Inject(PostsService)
    private postsService: PostsService,
    @Inject(BlogsService) private blogsService: BlogsService,
  ) {}

  @Get()
  async getAll(@Query() query: GetBlogsQueryParams) {
    return this.blogsQueryRepository.getAll(query);
  }

  @Post()
  async createBlog(@Body() body: CreateBlogInputDto) {
    const blogId = await this.blogsService.createBlog(body);
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
  ) {
    return this.postsQueryRepository.getPostByBlogIdOrFail(blogId, 'dummyId');
  }

  @ApiParam({ name: 'blogId' }) // for swagger
  @Post(':blogId/posts')
  async createPostByBlogId(
    @Param('blogId', ParseObjectIdOrBadRequestPipe) blogId: string,
    @Body() dto: CreatePostByBlogIdInputDto,
  ) {
    return this.postsService.createPost({ ...dto, blogId });
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
