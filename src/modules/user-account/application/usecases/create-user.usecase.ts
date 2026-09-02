import { CreateUserDto } from '../../dto/create-user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DomainException,
  Extensions,
} from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { Inject } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CryptoService } from '../crypto-service';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModelType } from '../../domain/user.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class CreateUserCommand {
  constructor(public readonly dto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<
  CreateUserCommand,
  string
> {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelType,
    @Inject() private usersRepository: UsersRepository,
    @Inject() private cryptoService: CryptoService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  public async execute({ dto }: CreateUserCommand) {
    await this.ensureLoginAndEmailAreUnique(dto.login, dto.email);

    const hashedPassword = await this.cryptoService.hashPassword(dto.password);

    const user = this.UserModel.createInstance({
      login: dto.login,
      email: dto.email,
      password: hashedPassword,
    });

    await this.dataSource.query(
      'INSERT INTO users (login, email, password) VALUES ($1, $2, $3)',
      [user.login, user.email, user.password],
    );

    // await this.usersRepository.save(user);
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
}
