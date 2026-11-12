import { UpdatePostDto } from '../dto/update-post.dto';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CURRENT_TIMESTAMP } from 'src/database/constants';
import { Blog } from '../../blogs/domain/blog.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  realtionalId: string;

  @Column({ name: 'title', type: 'varchar', length: 30, nullable: false })
  title: string;

  @Column({
    name: 'short_description',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  shortDescription: string;

  @Column({ name: 'content', type: 'varchar', length: 1000, nullable: false })
  content: string;

  @Column({ name: 'blog_id', type: 'bigint', nullable: false })
  blogId: string;

  @Column({
    name: 'blog_name',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  blogName: string;

  @Column({
    name: 'deleted_at',
    type: 'timestamp with time zone',
    default: null,
  })
  deletedAt: Date | null;

  @JoinColumn({ name: 'blog_id', referencedColumnName: 'relationalId' })
  @ManyToOne(() => Blog, { onDelete: 'CASCADE' })
  blog: Blog;

  set id(id: string) {
    this.realtionalId = id;
  }

  get id() {
    return this.realtionalId;
  }

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

  markDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }

  public update(dto: UpdatePostDto) {
    this.title = dto.title;
    this.content = dto.content;
    this.shortDescription = dto.shortDescription;
    this.blogId = dto.blogId;
  }
}
