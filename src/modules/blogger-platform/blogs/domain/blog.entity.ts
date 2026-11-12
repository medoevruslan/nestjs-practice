import { Nullable } from 'src/shared/common.types';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CURRENT_TIMESTAMP } from 'src/database/constants';

@Entity('blogs')
export class Blog {
  @PrimaryGeneratedColumn({ name: 'id', type: 'bigint' })
  relationalId: string;

  @Column({ name: 'name', type: 'varchar', length: 15, nullable: false })
  name: string;

  @Column({
    name: 'description',
    type: 'varchar',
    length: 500,
    nullable: false,
  })
  description: string;

  @Column({
    name: 'website_url',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  websiteUrl: string;

  /**
   * Creation timestamp
   * Explicitly defined despite timestamps: true
   * properties without @Prop for typescript so that they are in the class instance (or in instance methods)
   * @type {Date}
   */
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

  /**
   * Deletion timestamp, nullable, if date exist, means entity soft deleted
   * @type {Date | null}
   */
  @Column({
    name: 'deleted_at',
    type: 'timestamp with time zone',
    default: null,
  })
  deletedAt: Nullable<Date>;

  @Column({ name: 'is_membership', type: 'boolean', default: false })
  isMembership: boolean;

  get id() {
    return this.relationalId;
  }

  /**
   * Updates the blog instance with new data
   * @param {UpdateBlogDto} dto - The data transfer object for blog updates
   * DDD сontinue: инкапсуляция (вызываем методы, которые меняют состояние\св-ва) объектов согласно правилам этого объекта
   */
  public update(dto: UpdateBlogDto) {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }

  /**
   * Marks the blog as deleted
   * Throws an error if already deleted
   * @throws {Error} If the entity is already deleted
   * DDD сontinue: инкапсуляция (вызываем методы, которые меняют состояние\св-ва) объектов согласно правилам этого объекта
   */
  public markDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }
}
