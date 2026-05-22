import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UsersService } from '../../../user-account/application/users.service';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { ResentConfirmationEmailEvent } from '../events/resent-confirmation-email.event';

export class ResendConfirmationCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(ResendConfirmationCommand)
export class ResendConfirmationEmailUseCase implements ICommandHandler<ResendConfirmationCommand> {
  constructor(
    @Inject() private readonly usersService: UsersService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  async execute(command: ResendConfirmationCommand) {
    const found = await this.usersService.getByEmailNullable(command.email);

    if (!found || found.isEmailConfirmed) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Email is already confirmed or user does not exist',
        extensions: [
          {
            field: 'email',
            message: 'Email is already confirmed or user does not exist',
          },
        ],
      });
    }

    const code = await this.createRegistrationConfirmationCode(command.email);
    if (code) {
      this.eventBus.publish(
        new ResentConfirmationEmailEvent(command.email, code),
      );
    }
  }

  private async createRegistrationConfirmationCode(
    email: string,
  ): Promise<string | null> {
    const found = await this.usersService.getByEmailNullable(email);
    if (found) {
      const code = crypto.randomUUID();
      found.emailConfirmationCode = code;
      found.confirmationCodeExpiration = new Date(Date.now() + 1000 * 60 * 5);
      await this.usersService.save(found);
      return code;
    }

    return null;
  }
}
