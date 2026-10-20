import { Prop } from '@nestjs/mongoose';
import { UpdateUserEmailDto } from '../dto/update-user-email.dto';

// TODO: add migration with CHECK login and other fields
export class User {
  relationalId: string;

  get id() {
    return this.relationalId;
  }

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 10,
  })
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
}
