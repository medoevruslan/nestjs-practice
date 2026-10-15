import { SqlDate } from 'src/shared/common.types';
import { LikeParentType } from '../application/usecases/update-like-status.usecase';
import { Like, LikeStatus } from '../domain/like.entity';

export type LikeSqlRaw = {
  id: string | number | bigint;
  parent_id: string;
  parent_type: LikeParentType;
  status: LikeStatus;
  user_id: string;
  login: string;
  created_at: SqlDate;
  updated_at: SqlDate;
};

export class LikesMapper {
  static fromSqlRaw(raw: LikeSqlRaw): Like {
    const like = new Like();

    like.login = raw.login;
    like.createdAt = this.toDate(raw.created_at);
    like.updatedAt = this.toDate(raw.updated_at);
    like.parentId = raw.parent_id;
    like.userId = raw.user_id;
    like.parentType = raw.parent_type;
    like.status = raw.status;

    return like;
  }
  static toDate(dateLike: SqlDate) {
    return dateLike instanceof Date ? dateLike : new Date(dateLike);
  }
}
