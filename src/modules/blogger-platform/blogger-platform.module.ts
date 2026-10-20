import { Module } from '@nestjs/common';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsService } from './blogs/application/blogs.service';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from './blogs/infrastructure/query/blogs.query-repository';
import { PostsController } from './posts/api/posts.controller';
import { PostsQueryRepository } from './posts/infrastructure/query/posts.query-repository';
import { PostsRepository } from './posts/infrastructure/posts.repository';
import { PostsService } from './posts/application/posts.service';
import { CommentsController } from './comments/api/comments.controller';
import { CommentsQueryRepository } from './comments/infrastructure/query/comments-query.repository';
import { CreateBlogUseCase } from './blogs/application/usecases/create-blog.usecase';
import { CreatePostByBlogIdUseCase } from './blogs/application/usecases/create-post-by-blog-id.usecase';
import { CreatePostUseCase } from './posts/application/usecases/create-post.usecase';
import { CqrsModule } from '@nestjs/cqrs';
import { UpdatePostUseCase } from './posts/application/usecases/update-post.usecase';
import { DeletePostUseCase } from './posts/application/usecases/delete-post.usecase';
import { CreateCommentUseCase } from './comments/application/usecases/create-comment.usecase';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { UserAccountModule } from '../user-account/user-account.module';
import { UpdateCommentUseCase } from './comments/application/usecases/update-comment.usecase';
import { DeleteCommentUseCase } from './comments/application/usecases/delete-comment.usecase';
import { UpdateLikeStatusUseCase } from './likes/application/usecases/update-like-status.usecase';
import { BasicAuthGuard } from '../auth/guards/basic-auth.guard';
import { OptionalAuthGuard } from '../auth/guards/optional-auth.guard';
import { SaBlogsController } from './blogs/api/sa-blogs.controller';

@Module({
  imports: [CqrsModule, UserAccountModule],
  controllers: [
    BlogsController,
    SaBlogsController,
    PostsController,
    CommentsController,
  ],
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
    UpdateCommentUseCase,
    DeleteCommentUseCase,
    UpdateLikeStatusUseCase,
    PostsRepository,
    PostsService,
    CommentsQueryRepository,
    CommentsRepository,
    BasicAuthGuard,
    OptionalAuthGuard,
  ],
})
export class BloggerPlatformModule {}
