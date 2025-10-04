import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { CreatePostDomainDto } from './dto/create-post.domain-dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { Blog } from '../../blogs/domain/blog.entity';
import { LikeDocument, LikeStatus } from '../../likes/domain/like.entity';

@Schema({
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
})
export class Post {
  _id: Types.ObjectId;

  @Prop({ type: String, max: 30 })
  title: string;

  @Prop({ type: String, max: 100 })
  shortDescription: string;

  @Prop({ type: String, max: 1000 })
  content: string;

  @Prop({ type: Types.ObjectId, ref: Blog.name })
  blogId: string;

  @Prop({ type: Date, nullable: true })
  deletedAt: Date | null;

  get id() {
    return this._id.toString();
  }

  createdAt: Date;
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

PostSchema.virtual('likesCount', {
  ref: 'Like',
  count: true,
  localField: '_id',
  foreignField: 'parentId',
  match: { parentType: 'Post', status: LikeStatus.Like },
});

PostSchema.virtual('dislikesCount', {
  ref: 'Like',
  count: true,
  localField: '_id',
  foreignField: 'parentId',
  match: { parentType: 'Post', status: LikeStatus.Dislike },
});

PostSchema.virtual('newestLikes', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'parentId',
  justOne: false,
  match: { parentType: 'Post', status: LikeStatus.Like },
  options: { sort: { createdAt: -1 }, limit: 3 },
});

PostSchema.virtual('userLikeStatus', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'parentId',
  justOne: true,
  match: { parentType: 'Post' },
});

export type PostDocument = HydratedDocument<Post>;

export type PostWithLikesInfoDocument = PostDocument & {
  likesCount?: number;
  dislikesCount?: number;
  myStatus?: LikeStatus;
  newestLikes?: LikeDocument[];
};

export type PostModelType = Model<PostDocument> & typeof Post;
