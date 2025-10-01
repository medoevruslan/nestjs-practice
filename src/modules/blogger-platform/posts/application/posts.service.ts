import { Inject, Injectable } from '@nestjs/common';
import { GetPostsQueryParams } from '../api/input-dto/get-posts.query-params.input-dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { PostsRepository } from '../infrastructure/posts.repository';
import { CreatePostDto } from '../dto/create-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../domain/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    @Inject() private postsRepository: PostsRepository,
  ) {}

  getAll(query: GetPostsQueryParams) {}
  getPostById(id: string) {
    return this.postsRepository.getByIdOrFail(id);
  }

  async createPosts(dto: CreatePostDto) {
    const post = this.PostModel.createInstance({
      title: dto.title,
      blogId: dto.blogId,
      content: dto.content,
      shortDescription: dto.shortDescription,
    });

    await this.postsRepository.save(post);
    return post.id;
  }

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
