import { Injectable, NotFoundException } from '@nestjs/common';
import { Blog, BlogDocument, BlogModelType } from '../domain/blog.entity';
import { InjectModel } from '@nestjs/mongoose';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

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
    const found = await this.BlogModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!found) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
    }

    return found;
  }
}
