import { LikeStatus } from '../../enum/like-status';
import { CommentatorInfoDto } from './commentator-info-dto';

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfoDto;
  createdAt: string;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatus;
  };
}
