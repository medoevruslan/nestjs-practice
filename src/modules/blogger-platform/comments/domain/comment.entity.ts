import { LikeStatus } from '../../likes/domain/like.entity';
import { Nullable } from 'src/shared/common.types';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CURRENT_TIMESTAMP } from 'src/database/constants';
import { User } from 'src/modules/user-account/domain/user.entity';
import { Post } from '../../posts/domain/post.entity';

@Entity('comments')
@Check('CHK_comments_content_length', 'char_length("content") BETWEEN 20 AND 300')
export class Comment {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  relationalId: string;

  @Column({ name: 'content', type: 'text', nullable: false })
  content: string;

  @Column({ name: 'user_id', type: 'bigint', nullable: false })
  userId: string;

  @Column({
    name: 'user_login',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  userLogin: string;

  @Column({ name: 'post_id', type: 'bigint', nullable: false })
  postId: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
    default: () => CURRENT_TIMESTAMP,
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
    default: () => CURRENT_TIMESTAMP,
  })
  updatedAt: Date;

  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  @ManyToOne(() => User)
  user: User;

  @JoinColumn({ name: 'post_id', referencedColumnName: 'realtionalId' })
  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  post: Post;

  get id() {
    return this.relationalId;
  }

  @Column({
    name: 'deleted_at',
    type: 'timestamp with time zone',
    default: null,
  })
  deletedAt: Nullable<Date> = null;
}

export type CommentWithLikesInfo = Comment & {
  likesCount: number;
  dislikesCount: number;
  userLikeStatus: { status: LikeStatus };
};
