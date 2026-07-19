import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { PasswordRecoveryInputDto } from '../../api/input-dto/password-recovery-input.dto';
import { Inject } from '@nestjs/common';
import { UsersService } from '../../../user-account/application/users.service';
import { SentRecoveryPasswordEvent } from '../events/sent-recovery-password.event';

export class RecoveryPasswordCommand {
  constructor(public readonly dto: PasswordRecoveryInputDto) {}
}

@CommandHandler(RecoveryPasswordCommand)
export class RecoveryPasswordUseCase implements ICommandHandler<RecoveryPasswordCommand> {
  constructor(
    @Inject() private readonly usersService: UsersService,
    @Inject() private readonly eventBus: EventBus,
  ) {}

  async execute(command: RecoveryPasswordCommand) {
    const { dto } = command;

    const code = await this.createPasswordRecoveryCode(dto.email);
    if (code) {
      this.eventBus.publish(new SentRecoveryPasswordEvent(dto.email, code));
    }
  }

  private async createPasswordRecoveryCode(
    email: string,
  ): Promise<string | null> {
    const found = await this.usersService.getByEmailNullable(email);
    if (found) {
      const code = crypto.randomUUID();
      found.passwordRecoveryCode = code;
      found.confirmationCodeExpiration = new Date(Date.now() + 1000 * 60 * 5);
      await this.usersService.save(found);
      return code;
    }

    return null;
  }
}
