import { Inject, Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../domain/user.entity';
import { CryptoService } from './crypto-service';

@Injectable()
export class UsersService {
  constructor(
    @Inject() private usersRepository: UsersRepository,
    @InjectModel(User.name) private UserModel: UserModelType,
    @Inject() private cryptoService: CryptoService,
  ) {}

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
}
