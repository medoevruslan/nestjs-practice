import { CURRENT_TIMESTAMP } from 'src/database/constants';
import { User } from 'src/modules/user-account/domain/user.entity';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum LikeStatus {
  Like = 'Like',
  Dislike = 'Dislike',
  None = 'None',
}

@Entity('likes')
@Index('idx_like_unique', ['parentId', 'parentType', 'userId'], {
  unique: true,
})
@Check('CHK_likes_parent_type', `"parent_type" IN ('Post', 'Comment')`)
@Check('CHK_likes_status', `"status" IN ('Like', 'Dislike', 'None')`)
export class Like {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  id: string;

  @Column({ name: 'parent_id', type: 'bigint', nullable: false })
  parentId: string;

  @Column({ name: 'parent_type', type: 'varchar', length: 20, nullable: false })
  parentType: string;

  @Column({ name: 'user_id', type: 'bigint', nullable: false })
  userId: string;

  @Column({ name: 'login', type: 'varchar', length: 100, nullable: false })
  login: string;

  @Column({ name: 'status', type: 'varchar', length: 20, nullable: false })
  status: LikeStatus;

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
}
