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
    @Inject() private usersRepository: UsersRepository,
    @Inject() private cryptoService: CryptoService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  public async execute({ dto }: CreateUserCommand) {
    await this.ensureLoginAndEmailAreUnique(dto.login, dto.email);

    const hashedPassword = await this.cryptoService.hashPassword(dto.password);

    const [created] = await this.dataSource.query(
      `
        INSERT INTO users (login, email, password)
        VALUES ($1, $2, $3)
        RETURNING id::text AS id
      `,
      [dto.login, dto.email, hashedPassword],
    );

    return created.id;
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
