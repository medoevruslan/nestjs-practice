import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { CreatePostDomainDto } from './dto/create-post.domain-dto';
import { UpdatePostDto } from '../dto/update-post.dto';

@Schema({ timestamps: true })
export class Post {
  _id: Types.ObjectId;

  @Prop({ type: String, max: 30 })
  title: string;

  @Prop({ type: String, max: 100 })
  shortDescription: string;

  @Prop({ type: String, max: 1000 })
  content: string;

  @Prop({ type: Types.ObjectId })
  blogId: string;

  @Prop({ type: Date, nullable: true })
  deletedAt: Date | null;

  get id() {
    return this._id.toString();
  }

  created_at: Date;
  updated_at: Date;

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

  static createInstance(dto: CreatePostDomainDto) {
    const post = new this();
    post.blogId = dto.blogId;
    post.content = dto.content;
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    return post as PostDocument;
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.loadClass(Post);

export type PostDocument = HydratedDocument<Post>;

export type PostModelType = Model<PostDocument> & typeof Post;
