import { Injectable } from '@nestjs/common';

@Injectable()
export class BlogsQueryRepository {
  async getAll() {
    return 'all blogs';
  }
}
