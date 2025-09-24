import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument, BlogModelType } from '../domain/blog.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async getAll() {
    return 'all blogs';
  }

  async save(model: BlogDocument) {
    await model.save();
  }

  async getByIdOrNotFoundFail(id: string) {
    return this.BlogModel.findOne({ _id: id, deletedAt: null });
  }
}
