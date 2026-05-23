import { Module } from '@nestjs/common';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsService } from './blogs/application/blogs.service';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from './blogs/infrastructure/query/blogs.query-repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blog.entity';
import { PostsController } from './posts/api/posts.controller';
import { PostsQueryRepository } from './posts/infrastructure/query/posts.query-repository';
import { Post, PostSchema } from './posts/domain/post.entity';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { PostsService } from './posts/application/posts.service';
import { Like, LikeSchema } from './likes/domain/like.entity';
import { CommentsController } from './comments/api/comments.controller';
import { CommentsQueryRepository } from './comments/infrastructure/query/comments-query.repository';
import { Comment, CommentSchema } from './comments/domain/comment.entity';
import { CreateBlogUseCase } from './blogs/application/usecases/create-blog.usecase';
import { CreatePostByBlogIdUseCase } from './blogs/application/usecases/create-post-by-blog-id.usecase';
import { CreatePostUseCase } from './posts/application/usecases/create-post.usecase';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
    CqrsModule,
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    PostsQueryRepository,
    CreateBlogUseCase,
    CreatePostByBlogIdUseCase,
    CreatePostUseCase,
    PostsRepository,
    PostsService,
    CommentsQueryRepository,
  ],
})
export class BloggerPlatformModule {}
