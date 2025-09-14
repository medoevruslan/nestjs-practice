import { Injectable } from '@nestjs/common';
import { BlogDocument, BlogModelType } from '../domain/blog.entity';

@Injectable()
export class BlogsRepository {
  async getAll() {
    return 'all blogs';
  }

  async save(model: BlogDocument) {
    await model.save();
  }
}
