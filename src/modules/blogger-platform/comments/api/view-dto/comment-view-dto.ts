import { LikesViewDto } from '../../../likes/api/view-dto/likes-view.dto';
import { CommentWithLikesInfo } from '../../domain/comment.entity';

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
      createdAt: dto.createdAt.toISOString(),
      likesInfo: {
        likesCount: dto.likesCount,
        dislikesCount: dto.dislikesCount,
        myStatus: dto.userLikeStatus.status,
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
