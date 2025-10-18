import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { CreateCommentDomainDto } from './dto/create-comment.domain-dto';
import { LikeStatus } from '../../likes/domain/like.entity';

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Comment {
  _id: Types.ObjectId;

  @Prop({ type: String, max: 300, min: 20, required: true })
  content: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  userLogin: string;

  @Prop({ type: Types.ObjectId, ref: 'Post', required: true })
  postId: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;

  get id() {
    return this._id.toString();
  }

  static createInstance(dto: CreateCommentDomainDto) {
    const comment = new this();
    comment.content = dto.content;
    comment.postId = new Types.ObjectId(dto.postId);
    comment.userLogin = dto.userLogin;
    comment.userId = new Types.ObjectId(dto.userId);
    return comment as CommentDocument;
  }

  markDeleted(comment: CommentDocument) {
    if (this.deletedAt !== null) {
      throw Error('Entity is already deleted');
    }
    comment.deletedAt = new Date();
  }

  @Prop({ type: Date, default: null })
  deletedAt: Date | null = null;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.virtual('likesCount', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'parentId',
  count: true,
  match: { parentType: 'Comment', status: LikeStatus.Like },
});

CommentSchema.virtual('dislikesCount', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'parentId',
  count: true,
  match: { parentType: 'Comment', status: LikeStatus.Dislike },
});

CommentSchema.virtual('userLikeStatus', {
  ref: 'Like',
  localField: '_id',
  foreignField: 'parentId',
  justOne: true,
  match: { parentType: 'Comment' },
});

export type CommentDocument = HydratedDocument<Comment>;

export type CommentWithLikesInfo = CommentDocument & {
  likesCount?: number;
  dislikesCount?: number;
  myStatus?: LikeStatus;
};

export type CommentModelType = Model<CommentDocument> & typeof Comment;
