import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users.repository';

export class DeleteUserCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(@Inject() private usersRepository: UsersRepository) {}

  public async execute(command: DeleteUserCommand): Promise<string> {
    try {
      const user = await this.usersRepository.findByIdOrFail(command.userId);
      user.markDeleted();
      await this.usersRepository.save(user);
      return user.id;
    } catch (error) {
      throw error;
    }
  }
}
