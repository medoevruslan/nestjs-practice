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
import { UpdatePostUseCase } from './posts/application/usecases/update-post.usecase';
import { DeletePostUseCase } from './posts/application/usecases/delete-post.usecase';
import { AuthModule } from '../auth/auth.module';
import { CreateCommentUseCase } from './comments/application/usecases/create-comment.usecase';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { UserAccountModule } from '../user-account/user-account.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
    CqrsModule,
    AuthModule,
    UserAccountModule
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    PostsQueryRepository,
    CreateBlogUseCase,
    CreatePostByBlogIdUseCase,
    CreateCommentUseCase,
    CreatePostUseCase,
    UpdatePostUseCase,
    DeletePostUseCase,
    PostsRepository,
    PostsService,
    CommentsQueryRepository,
    CommentsRepository
  ],
})
export class BloggerPlatformModule { }
