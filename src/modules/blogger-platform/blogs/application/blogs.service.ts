import { Inject, Injectable } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../domain/blog.entity';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @Inject(BlogsRepository) private blogsRepository: BlogsRepository,
  ) {}

  async getAll() {
    return this.blogsRepository.getAll();
  }

  async createBlog(dto: CreateBlogDto) {
    const blog = this.BlogModel.createInstance({
      name: dto.name,
      websiteUrl: dto.websiteUrl,
      description: dto.description,
    });

    await this.blogsRepository.save(blog);
    return blog.id;
  }
}
