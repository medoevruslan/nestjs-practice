import { LikeStatus } from '../../domain/like.entity';

export class LikesViewDto {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
  newestLikes: LikesDetailsView[];
}

class LikesDetailsView {
  addedAt: string;
  userId: string;
  login: string;
}
