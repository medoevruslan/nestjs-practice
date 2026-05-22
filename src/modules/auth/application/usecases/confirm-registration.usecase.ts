import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { UsersService } from '../../../user-account/application/users.service';
import { Inject } from '@nestjs/common';

export class ConfirmRegistrationCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(ConfirmRegistrationCommand)
export class ConfirmRegistrationUseCase implements ICommandHandler<ConfirmRegistrationCommand> {
  constructor(@Inject() private readonly usersService: UsersService) {}

  async execute(command: ConfirmRegistrationCommand) {
    const found = await this.usersService.getByEmailConfirmationCodeNullable(
      command.code,
    );

    if (
      !found ||
      !found.confirmationCodeExpiration ||
      Date.now() > found.confirmationCodeExpiration.getTime()
    ) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeExpired,
        message: 'Confirmation code is invalid or expired',
        extensions: [
          { field: 'code', message: 'Confirmation code is invalid or expired' },
        ],
      });
    }

    if (found.isEmailConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Confirmation code is invalid or expired',
        extensions: [
          { field: 'code', message: 'Confirmation code is invalid or expired' },
        ],
      });
    }

    found.isEmailConfirmed = true;
    found.confirmationCodeExpiration = null;
    await this.usersService.save(found);
  }
}
