import { Inject, Injectable } from '@nestjs/common';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { UpdateBlogDto } from '../dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(
    @Inject(BlogsRepository) private blogsRepository: BlogsRepository,
  ) {}

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
