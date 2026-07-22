import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { LikeStatus } from '../../domain/like.entity';

export class LikeStatusInputDto {
  @ApiProperty({ enum: LikeStatus, example: LikeStatus.Like })
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}
