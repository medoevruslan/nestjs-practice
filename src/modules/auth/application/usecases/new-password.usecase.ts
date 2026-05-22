import { NewPasswordDto } from '../../dto/new-password.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../../../user-account/application/users.service';
import { Inject } from '@nestjs/common';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { CryptoService } from '../../../user-account/application/crypto-service';

export class NewPasswordCommand {
  constructor(public readonly dto: NewPasswordDto) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase implements ICommandHandler<NewPasswordCommand> {
  constructor(
    @Inject() private readonly usersService: UsersService,
    @Inject() private readonly cryptoService: CryptoService,
  ) {}

  async execute(command: NewPasswordCommand) {
    const { dto } = command;

    const found = await this.usersService.getByPasswordRecoveryCodeNullable(
      dto.code,
    );

    if (
      !found ||
      !found.confirmationCodeExpiration ||
      Date.now() > found.confirmationCodeExpiration.getTime()
    ) {
      throw new DomainException({
        code: DomainExceptionCode.PasswordRecoveryCodeExpired,
        message: 'Recovery code is invalid or expired',
      });
    }

    const hashedPassword = await this.cryptoService.hashPassword(dto.password);

    found.password = hashedPassword;
    found.confirmationCodeExpiration = null;
    found.passwordRecoveryCode = null;
    await this.usersService.save(found);
  }
}
