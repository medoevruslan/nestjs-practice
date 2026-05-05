import { Inject, Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../domain/user.entity';
import { CryptoService } from './crypto-service';
import {
  DomainException,
  Extensions,
} from '../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../core/exceptions/domain-exception-codes';

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

  async getByLoginNullable(login: string) {
    return this.usersRepository.findByLoginOrNull(login);
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
    await this.ensureLoginAndEmailAreUnique(dto.login, dto.email);

    const hashedPassword = await this.cryptoService.hashPassword(dto.password);

    const user = this.UserModel.createInstance({
      login: dto.login,
      email: dto.email,
      password: hashedPassword,
    });

    await this.usersRepository.save(user);
    return user.id;
  }

  private async ensureLoginAndEmailAreUnique(login: string, email: string) {
    const [userWithLogin, userWithEmail] = await Promise.all([
      this.usersRepository.findByLoginOrNull(login),
      this.usersRepository.findByEmailOrNull(email),
    ]);

    const extensions: Extensions[] = [];

    if (userWithLogin) {
      extensions.push({ field: 'login', message: 'Login already exists' });
    }

    if (userWithEmail) {
      extensions.push({ field: 'email', message: 'Email already exists' });
    }

    if (extensions.length) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'User already exists',
        extensions,
      });
    }
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
