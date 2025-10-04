import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';

export enum LikeStatus {
  Like = 'Like',
  Dislike = 'Dislike',
  None = 'None',
}

@Schema({ timestamps: true })
export class Like {
  @Prop({ type: Types.ObjectId, required: true })
  parentId: string;

  @Prop({ type: String, enum: ['Post', 'Comment'], required: true })
  parentType: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ type: String, required: true })
  login: string;

  @Prop({ type: String, enum: LikeStatus, default: LikeStatus.None })
  status: LikeStatus;

  createdAt: Date;
  updatedAt: Date;
}

export const LikeSchema = SchemaFactory.createForClass(Like);

export type LikeDocument = HydratedDocument<Like>;

export type LikeModel = Model<LikeDocument>;
