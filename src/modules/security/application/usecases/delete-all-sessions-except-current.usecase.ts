import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import {
  DeviceAuthSession,
  DeviceAuthSessionModel,
} from '../../domain/device-auth-session.entity';

export class DeleteAllSessionsExceptCurrentCommand {
  constructor(
    readonly currentSessionId: string,
    readonly userId: string,
  ) {}
}

@CommandHandler(DeleteAllSessionsExceptCurrentCommand)
export class DeleteAllSessionsExceptCurrentUseCase implements ICommandHandler<DeleteAllSessionsExceptCurrentCommand> {
  constructor(
    @InjectModel(DeviceAuthSession.name)
    private readonly model: DeviceAuthSessionModel,
  ) {}

  async execute(command: DeleteAllSessionsExceptCurrentCommand) {
    const res = await this.model.updateMany(
      { userId: command.userId, _id: { $ne: command.currentSessionId } },
      { $set: { deletedAt: new Date() } },
    );
    return res.acknowledged;
  }
}
