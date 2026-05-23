import { Inject, Injectable } from '@nestjs/common';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostsRepository } from '../infrastructure/posts.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../domain/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    @Inject() private postsRepository: PostsRepository,
  ) {}

  async updatePost(id: string, dto: UpdatePostDto) {
    const post = await this.postsRepository.getByIdOrFail(id);
    post.update(dto);
    await this.postsRepository.save(post);
    return post.id;
  }

  async deletePost(id: string) {
    const post = await this.postsRepository.getByIdOrFail(id);
    post.markDeleted();
    await this.postsRepository.save(post);
    return post.id;
  }
}
