import { PostWithLikesInfoDocument } from '../../domain/post.entity';
import { ExtendedLikesViewDto } from '../../../likes/api/view-dto/likes-view.dto';
import { LikeStatus } from '../../../likes/domain/like.entity';

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesViewDto;

  public static mapToView(post: PostWithLikesInfoDocument): PostViewDto {
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: '',
      createdAt: post.createdAt.toISOString(),
      extendedLikesInfo: {
        likesCount: post.likesCount ?? 0,
        dislikesCount: post.dislikesCount ?? 0,
        myStatus: post.myStatus ?? LikeStatus.None,
        newestLikes:
          post.newestLikes?.map((like) => ({
            addedAt: like.createdAt.toISOString(),
            userId: like.userId,
            login: like.login,
          })) ?? [],
      },
    };
  }
}
