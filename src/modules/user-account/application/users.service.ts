import { Inject, Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../domain/user.entity';
import { CryptoService } from './crypto-service';

@Injectable()
export class UsersService {
  constructor(
    @Inject() private usersRepository: UsersRepository,
    @InjectModel(User.name) private UserModel: UserModelType,
    @Inject() private cryptoService: CryptoService,
  ) {}

  async save(user: UserDocument) {
    await this.usersRepository.save(user);
  }

  async getById(id: string) {
    return this.usersRepository.findByIdOrFail(id);
  }

  async getByEmail(email: string) {
    return this.usersRepository.findByEmailOrFail(email);
  }

  async getByLoginOrEmailNullable(loginOrEmail: string) {
    return this.usersRepository.findByEmailOrEmailOrNull(loginOrEmail);
  }

  async getByEmailNullable(email: string) {
    return this.usersRepository.findByEmailOrNull(email);
  }

  async getByPasswordRecoveryCode(code: string) {
    return this.usersRepository.findByPasswordRecoveryCodeOrFail(code);
  }

  async getByPasswordRecoveryCodeNullable(code: string) {
    return this.usersRepository.findByPasswordRecoveryCodeOrNull(code);
  }

  async getByEmailConfirmationCodeNullable(code: string) {
    return this.usersRepository.findByEmailConfirmationCodeOrNull(code);
  }

  async createUser(dto: CreateUserDto): Promise<string> {
    const hashedPassword = await this.cryptoService.hashPassword(dto.password);

    const user = this.UserModel.createInstance({
      login: dto.login,
      email: dto.email,
      password: hashedPassword,
    });

    await this.usersRepository.save(user);
    return user.id;
  }

  async deleteUser(id: string): Promise<string> {
    const user = await this.usersRepository.findByIdOrFail(id);
    user.markDeleted();
    await this.usersRepository.save(user);
    return user.id;
  }

  async confirmUser(code: string) {
    const found =
      await this.usersRepository.findByEmailConfirmationCodeOrNull(code);
    if (found) {
      found.isEmailConfirmed = true;
      await this.usersRepository.save(found);
    }
  }
}
