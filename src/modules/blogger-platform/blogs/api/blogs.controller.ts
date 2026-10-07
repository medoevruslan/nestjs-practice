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
import { BlogsService } from '../application/blogs.service';
import { BlogsQueryRepository } from '../infrastructure/query/blogs.query-repository';
import { ApiBasicAuth, ApiParam } from '@nestjs/swagger';
import {
  CreateBlogInputDto,
  CreatePostByBlogIdInputDto,
  UpdateBlogInputDto,
} from './input-dto/blog.input-dto';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params-input.dto';
import { PostsQueryRepository } from '../../posts/infrastructure/query/posts.query-repository';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts.query-params.input-dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../application/usecases/create-blog.usecase';
import { CreatePostByBlogIdCommand } from '../application/usecases/create-post-by-blog-id.usecase';
import { BasicAuthGuard } from '../../../auth/guards/basic-auth.guard';
import { OptionalAuthGuard } from '../../../auth/guards/optional-auth.guard';
import { CurrentUserId } from 'src/core/decorators/auth/create-param.decorator';
import { ParseRelationalIdOrBadRequestPipe } from '../../../../core/pipes/parse-relational-id-or-bad-request.pipe';

@Controller('blogs')
export class BlogsController {
  constructor(
    @Inject()
    private readonly blogsQueryRepository: BlogsQueryRepository,
    @Inject()
    private readonly postsQueryRepository: PostsQueryRepository,
    @Inject() private readonly blogsService: BlogsService,
    @Inject() private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async getAll(@Query() query: GetBlogsQueryParams) {
    return this.blogsQueryRepository.getAll(query);
  }

  @ApiBasicAuth('basic')
  @Post()
  @UseGuards(BasicAuthGuard)
  async createBlog(@Body() body: CreateBlogInputDto) {
    const blogId = await this.commandBus.execute<CreateBlogCommand, string>(
      new CreateBlogCommand(body),
    );
    return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @ApiParam({ name: 'id' }) // for swagger
  @Get(':id')
  async getBlogById(
    @Param('id', ParseRelationalIdOrBadRequestPipe) id: string,
  ) {
    return this.blogsQueryRepository.getByIdOrNotFoundFail(id);
  }

  @ApiParam({ name: 'blogId' }) // for swagger
  @Get(':blogId/posts')
  @UseGuards(OptionalAuthGuard)
  async getPostByBlogId(
    @Param('blogId', ParseRelationalIdOrBadRequestPipe) blogId: string,
    @Query() query: GetPostsQueryParams,
    @CurrentUserId() userId: string,
  ) {
    return this.postsQueryRepository.getPostByBlogIdOrFail(
      blogId,
      userId,
      query,
    );
  }

  @ApiBasicAuth('basic')
  @ApiParam({ name: 'blogId' })
  @UseGuards(BasicAuthGuard)
  @Post(':blogId/posts')
  async createPostByBlogId(
    @Param('blogId', ParseRelationalIdOrBadRequestPipe) blogId: string,
    @Body() dto: CreatePostByBlogIdInputDto,
  ) {
    const postId = await this.commandBus.execute(
      new CreatePostByBlogIdCommand({ ...dto, blogId: blogId }),
    );
    return this.postsQueryRepository.getPostByIdOrFail(postId, 'dummyId');
  }

  @ApiBasicAuth('basic')
  @ApiParam({ name: 'id' })
  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id', ParseRelationalIdOrBadRequestPipe) id: string,
    @Body() dto: UpdateBlogInputDto,
  ) {
    const blogId = await this.blogsService.updateBlog(id, dto);
    return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @ApiBasicAuth('basic')
  @ApiParam({ name: 'id' }) // for swagger
  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id', ParseRelationalIdOrBadRequestPipe) id: string) {
    return this.blogsService.deleteById(id);
  }
}
