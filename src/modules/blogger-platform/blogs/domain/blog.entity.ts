import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { CreateBlogDomainDto } from './dto/create-blog.domain.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';

@Schema({ timestamps: true })
export class Blog {
  _id: Types.ObjectId;

  @Prop({ type: String, required: true, maxLength: 15 })
  name: string;

  @Prop({ type: String, required: true, maxLength: 500 })
  description: string;

  @Prop({
    type: String,
    maxLength: 100,
    match: [
      /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/,
      'websiteUrl should be a valid HTTPS URL',
    ],
  })
  websiteUrl: string;

  /**
   * Creation timestamp
   * Explicitly defined despite timestamps: true
   * properties without @Prop for typescript so that they are in the class instance (or in instance methods)
   * @type {Date}
   */
  createdAt: Date;
  updatedAt: Date;

  /**
   * Deletion timestamp, nullable, if date exist, means entity soft deleted
   * @type {Date | null}
   */
  @Prop({ type: Date, nullable: true })
  deletedAt: Date | null;

  @Prop({ type: Boolean, default: false })
  isMembership: boolean;

  get id() {
    return this._id.toString();
  }

  /**
   * Factory method to create a Blog instance
   * @param {CreateBlogDomainDto} dto - The data transfer object for blog creation
   * @returns {BlogDocument} The created blog document
   * DDD started: как создать сущность, чтобы она не нарушала бизнес-правила? Делегируем это создание статическому методу
   */
  public static createInstance(dto: CreateBlogDomainDto): BlogDocument {
    const blog = new this();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.deletedAt = null;
    blog.isMembership = false;

    return blog as BlogDocument;
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

// create schema from class
export const BlogSchema = SchemaFactory.createForClass(Blog);

// register entity's methods in schema
BlogSchema.loadClass(Blog);

// document typing
export type BlogDocument = HydratedDocument<Blog>;

// model typing
export type BlogModelType = Model<BlogDocument> & typeof Blog;
