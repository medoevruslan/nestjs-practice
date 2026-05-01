import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../domain/user.entity';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  async save(user: UserDocument) {
    await user.save();
  }

  async findByIdOrFail(id: string): Promise<UserDocument> {
    const found = await this.UserModel.findOne({ _id: id, deletedAt: null });

    if (!found) {
      throw new NotFoundException();
    }

    return found;
  }

  async findByEmailOrFail(email: string): Promise<UserDocument> {
    const found = await this.UserModel.findOne({ email, deletedAt: null });

    if (!found) {
      throw new NotFoundException();
    }

    return found;
  }

  async findByEmailOrNull(email: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({ email, deletedAt: null });
  }

  async findByEmailConfirmationCodeOrFail(code: string): Promise<UserDocument> {
    const found = await this.UserModel.findOne({
      emailConfirmationCode: code,
      deletedAt: null,
    });

    if (!found) {
      throw new NotFoundException();
    }

    return found;
  }

  async findByPasswordRecoveryCodeOrFail(code: string): Promise<UserDocument> {
    const found = await this.UserModel.findOne({
      passwordRecoveryCode: code,
      deletedAt: null,
    });

    if (!found) {
      throw new NotFoundException();
    }

    return found;
  }

  async findByEmailConfirmationCodeOrNull(
    code: string,
  ): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      emailConfirmationCode: code,
      deletedAt: null,
    });
  }

  async findByPasswordRecoveryCodeOrNull(
    code: string,
  ): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      passwordRecoveryCode: code,
      deletedAt: null,
    });
  }
}
