import {
  CommandBus,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import { RegisterUserDto } from '../../dto/register-user.dto';
import { Inject, Logger } from '@nestjs/common';
import { CreateUserCommand } from '../../../user-account/application/usecases/create-user.usecase';
import { UserRegisteredEvent } from '../events/user-registered.event';
import { UsersService } from '../../../user-account/application/users.service';

export class RegisterUserCommand {
  constructor(public readonly registerUserDto: RegisterUserDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<RegisterUserCommand> {
  private readonly logger = new Logger(RegisterUserUseCase.name);

  constructor(
    @Inject() private readonly commandBus: CommandBus,
    @Inject() private eventBus: EventBus,
    @Inject() private readonly usersService: UsersService,
  ) {}

  public async execute(command: RegisterUserCommand) {
    const userId = await this.commandBus.execute<CreateUserCommand, string>(
      new CreateUserCommand(command.registerUserDto),
    );

    try {
      const found = await this.usersService.getByIdOrFail(userId);
      const code = crypto.randomUUID();
      found.emailConfirmationCode = code;
      found.confirmationCodeExpiration = new Date(Date.now() + 1000 * 60 * 5);
      await this.usersService.save(found);
      this.eventBus.publish(
        new UserRegisteredEvent(command.registerUserDto.email, code),
      );
    } catch (error) {
      this.logger.error(
        `Failed to register user ${command.registerUserDto.email}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
