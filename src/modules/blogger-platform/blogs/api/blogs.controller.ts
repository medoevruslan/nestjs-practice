import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { BlogsService } from '../application/blogs.service';
import { BlogsQueryRepository } from '../infrastructure/query/blogs.query-repository';
import { ApiParam } from '@nestjs/swagger';
import { CreateBlogInputDto } from './input-dto/blog.input-dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    @Inject(BlogsQueryRepository)
    private blogsQueryRepository: BlogsQueryRepository,
    @Inject(BlogsService) private blogsService: BlogsService,
  ) {}

  @Get()
  async getAll() {
    return this.blogsQueryRepository.getAll();
  }

  @Post()
  async createBlog(@Body() body: CreateBlogInputDto) {}

  @ApiParam({ name: 'id' }) // for swagger
  @Get(':id')
  async getBlogById(@Param('id') id: string) {}

  @Put(':id')
  async updateBlog(@Param('id') id: string) {}

  @ApiParam({ name: 'id' }) // for swagger
  @Delete(':id')
  async deleteBlog(@Param('id') id: string) {}
}
