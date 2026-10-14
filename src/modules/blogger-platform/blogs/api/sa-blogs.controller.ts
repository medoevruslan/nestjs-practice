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
import { ApiBasicAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import {
  CreateBlogInputDto,
  CreatePostByBlogIdInputDto,
  UpdateBlogInputDto,
} from './input-dto/blog.input-dto';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params-input.dto';
import { BlogsQueryRepository } from '../infrastructure/query/blogs.query-repository';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { BlogsService } from '../application/blogs.service';
import { CreateBlogCommand } from '../application/usecases/create-blog.usecase';
import { CreatePostByBlogIdCommand } from '../application/usecases/create-post-by-blog-id.usecase';
import { PostsQueryRepository } from '../../posts/infrastructure/query/posts.query-repository';
import { PostsRepository } from '../../posts/infrastructure/posts.repository';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts.query-params.input-dto';
import { UpdatePostCommand } from '../../posts/application/usecases/update-post.usecase';
import { DeletePostCommand } from '../../posts/application/usecases/delete-post.usecase';
import { BasicAuthGuard } from '../../../auth/guards/basic-auth.guard';
import { ParseRelationalIdOrBadRequestPipe } from '../../../../core/pipes/parse-relational-id-or-bad-request.pipe';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

@ApiTags('Blogs')
@ApiBasicAuth('basic')
@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
export class SaBlogsController {
  constructor(
    @Inject() private readonly blogsQueryRepository: BlogsQueryRepository,
    @Inject() private readonly blogsRepository: BlogsRepository,
    @Inject() private readonly postsQueryRepository: PostsQueryRepository,
    @Inject() private readonly postsRepository: PostsRepository,
    @Inject() private readonly blogsService: BlogsService,
    @Inject() private readonly commandBus: CommandBus,
  ) {}

  @Get()
  async getBlogs(@Query() query: GetBlogsQueryParams) {
    return this.blogsQueryRepository.getAll(query);
  }

  @Post()
  async createBlog(@Body() dto: CreateBlogInputDto) {
    const blogId = await this.commandBus.execute<CreateBlogCommand, string>(
      new CreateBlogCommand(dto),
    );

    return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @ApiParam({ name: 'id' })
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id', ParseRelationalIdOrBadRequestPipe) id: string,
    @Body() dto: UpdateBlogInputDto,
  ) {
    await this.blogsService.updateBlog(id, dto);
  }

  @ApiParam({ name: 'id' })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id', ParseRelationalIdOrBadRequestPipe) id: string) {
    await this.blogsService.deleteById(id);
  }

  @ApiParam({ name: 'blogId' })
  @Post(':blogId/posts')
  async createPost(
    @Param('blogId', ParseRelationalIdOrBadRequestPipe) blogId: string,
    @Body() dto: CreatePostByBlogIdInputDto,
  ) {
    const postId = await this.commandBus.execute<
      CreatePostByBlogIdCommand,
      string
    >(new CreatePostByBlogIdCommand({ ...dto, blogId }));

    return this.postsQueryRepository.getPostByIdOrFail(postId, 'unknown_id');
  }

  @ApiParam({ name: 'blogId' })
  @Get(':blogId/posts')
  async getPosts(
    @Param('blogId', ParseRelationalIdOrBadRequestPipe) blogId: string,
    @Query() query: GetPostsQueryParams,
  ) {
    return this.postsQueryRepository.getPostByBlogIdOrFail(
      blogId,
      'unknown_id',
      query,
    );
  }

  @ApiParam({ name: 'blogId' })
  @ApiParam({ name: 'postId' })
  @Put(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('blogId', ParseRelationalIdOrBadRequestPipe) blogId: string,
    @Param('postId', ParseRelationalIdOrBadRequestPipe) postId: string,
    @Body() dto: CreatePostByBlogIdInputDto,
  ) {
    await this.ensurePostBelongsToBlog(blogId, postId);
    await this.commandBus.execute(
      new UpdatePostCommand(postId, { ...dto, blogId }),
    );
  }

  @ApiParam({ name: 'blogId' })
  @ApiParam({ name: 'postId' })
  @Delete(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('blogId', ParseRelationalIdOrBadRequestPipe) blogId: string,
    @Param('postId', ParseRelationalIdOrBadRequestPipe) postId: string,
  ) {
    await this.ensurePostBelongsToBlog(blogId, postId);
    await this.commandBus.execute(new DeletePostCommand(postId));
  }

  private async ensurePostBelongsToBlog(blogId: string, postId: string) {
    await this.blogsRepository.getByIdOrNotFoundFail(blogId);
    const post = await this.postsRepository.getByIdOrFail(postId);

    if (post.blogId !== blogId) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }
  }
}
