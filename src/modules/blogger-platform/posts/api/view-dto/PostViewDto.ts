import { Post } from '../../domain/post.entity';
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

  public static mapToView(
    post: Post,
    likesInfo?: ExtendedLikesViewDto,
  ): PostViewDto {
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId.toString(),
      blogName: post.blogName,
      createdAt: post.createdAt.toISOString(),
      extendedLikesInfo: likesInfo ?? {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: [],
      },
    };
  }
}
