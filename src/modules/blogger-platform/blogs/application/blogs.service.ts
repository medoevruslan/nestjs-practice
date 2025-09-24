import { Inject, Injectable } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../domain/blog.entity';
import { UpdateBlogDto } from '../dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @Inject(BlogsRepository) private blogsRepository: BlogsRepository,
  ) {}

  async getAll() {
    return this.blogsRepository.getAll();
  }

  async createBlog(dto: CreateBlogDto): Promise<string> {
    const blog = this.BlogModel.createInstance({
      name: dto.name,
      websiteUrl: dto.websiteUrl,
      description: dto.description,
    });

    await this.blogsRepository.save(blog);
    return blog.id;
  }

  async updateBlog(id: string, dto: UpdateBlogDto) {
    const blog = await this.blogsRepository.getByIdOrNotFoundFail(id);
    blog.update(dto);

    await this.blogsRepository.save(blog);
    return blog.id;
  }

  async deleteById(id: string) {
    const blog = await this.blogsRepository.getByIdOrNotFoundFail(id);
    blog.markDeleted();
    await this.blogsRepository.save(blog);
    return blog.id;
  }
}
