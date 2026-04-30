import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, Types } from 'mongoose';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserEmailDto } from '../dto/update-user-email.dto';

@Schema({
  timestamps: true,
  // toObject: { virtuals: true },
  // toJSON: { virtuals: true },
})
export class User {
  _id: Types.ObjectId;

  get id() {
    return this._id.toString();
  }

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: true, unique: true })
  login: string;

  @Prop({ type: String, default: null })
  firstName: string | null;

  @Prop({
    type: String,
    default: null,
  })
  lastName: string | null;

  get fullName() {
    return `${this.firstName ?? ''} ${this.lastName ?? ''}`;
  }

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: Boolean, default: false })
  isEmailConfirmed: boolean;

  @Prop({ type: String, default: null })
  emailConfirmationCode: string | null;

  @Prop({ type: String, default: null })
  passwordRecoveryCode: string | null;

  @Prop({ type: Date, default: null })
  confirmationCodeExpiration: Date | null;

  createdAt: Date;
  updatedAt: Date;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  markDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }

  updateEmail(dto: UpdateUserEmailDto) {
    if (!this.isEmailConfirmed) {
      throw Error('Update not allowed: email is not confirmed');
    }
    this.email = dto.email;
    this.isEmailConfirmed = false;
  }

  static createInstance(dto: CreateUserDto) {
    const user = new this();
    user.password = dto.password;
    user.login = dto.login;
    user.email = dto.email;
    user.isEmailConfirmed = false;
    user.deletedAt = null;
    return user as UserDocument;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.loadClass(User);

export type UserDocument = HydratedDocument<User>;
export type UserModelType = Model<UserDocument> & typeof User;
