import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  HydratedDocument,
  Model,
  Schema as MongooseSchema,
  Types,
} from 'mongoose';

export enum LikeStatus {
  Like = 'Like',
  Dislike = 'Dislike',
  None = 'None',
}

@Schema({ timestamps: true })
export class Like {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  parentId: Types.ObjectId;

  @Prop({ type: String, enum: ['Post', 'Comment'], required: true })
  parentType: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  login: string;

  @Prop({ type: String, enum: LikeStatus, default: LikeStatus.None })
  status: LikeStatus;

  createdAt: Date;
  updatedAt: Date;
}

export const LikeSchema = SchemaFactory.createForClass(Like);

LikeSchema.index({ parentId: 1, parentType: 1, userId: 1 }, { unique: true });

export type LikeDocument = HydratedDocument<Like>;

export type LikeModel = Model<LikeDocument>;
