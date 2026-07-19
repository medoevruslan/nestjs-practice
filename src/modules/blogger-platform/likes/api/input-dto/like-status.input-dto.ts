import { IsEnum } from 'class-validator';
import { LikeStatus } from '../../domain/like.entity';

export class LikeStatusInputDto {
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}
