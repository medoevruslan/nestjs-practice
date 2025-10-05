import { LikesViewDto } from '../../../likes/api/view-dto/likes-view.dto';
import { CommentWithLikesInfo } from '../../domain/comment.entity';
import { LikeStatus } from '../../../likes/domain/like.entity';

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfoDto;
  createdAt: string;
  likesInfo: LikesViewDto;

  static mapToView(dto: CommentWithLikesInfo): CommentViewDto {
    return {
      id: dto.id,
      content: dto.content,
      createdAt: dto.createdAt.toString(),
      likesInfo: {
        likesCount: dto.likesCount ?? 0,
        dislikesCount: dto.dislikesCount ?? 0,
        myStatus: dto.myStatus ?? LikeStatus.None,
      },
      commentatorInfo: {
        userId: dto.userId.toString(),
        userLogin: dto.userLogin,
      },
    };
  }
}

class CommentatorInfoDto {
  userId: string;
  userLogin: string;
}
