import {
  HydratedDocument,
  Model,
  Types,
  Schema as MongooseSchema,
} from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreateDeviceAuthSessionDomainDto } from './dto/create-device-auth-session.domain.dto';

@Schema()
export class DeviceAuthSession {
  _id: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, required: true })
  ip: string;

  @Prop({ type: Types.UUID, required: true })
  deviceId: string;

  @Prop({ type: String, required: true })
  deviceName: string;

  @Prop({ type: Number, required: true })
  iat: number;

  @Prop({ type: Number, required: true })
  exp: number;

  @Prop({ type: Number, default: null })
  lastActiveAt: number | null;

  @Prop({ type: String, default: null })
  refreshTokenHash: string | null;

  createdAt: Date;
  updatedAt: Date;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  get id() {
    return this._id.toString();
  }

  public static createInstance(
    dto: CreateDeviceAuthSessionDomainDto,
  ): DeviceAuthSessionDocument {
    const instance = new this();
    instance.ip = dto.ip;
    instance.exp = dto.exp;
    instance.iat = dto.iat;
    instance.userId = dto.userId;
    instance.deviceId = dto.deviceId;
    instance.deviceName = dto.deviceName;
    instance.lastActiveAt = Date.now();
    instance.refreshTokenHash = dto.refreshTokenHash;
    return instance as DeviceAuthSessionDocument;
  }

  markDeleted() {
    if (this.deletedAt != null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }
}

export const DeviceAuthSessionSchema =
  SchemaFactory.createForClass(DeviceAuthSession);

DeviceAuthSessionSchema.loadClass(DeviceAuthSession);

export type DeviceAuthSessionDocument = HydratedDocument<DeviceAuthSession>;

export type DeviceAuthSessionModel = Model<DeviceAuthSessionDocument> &
  typeof DeviceAuthSession;
