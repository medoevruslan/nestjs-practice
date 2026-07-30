import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import {
  DeviceAuthSession,
  DeviceAuthSessionModel,
} from '../../domain/device-auth-session.entity';

export class DeleteAllSessionsExceptCurrentCommand {}

@CommandHandler(DeleteAllSessionsExceptCurrentCommand)
export class DeleteAllSessionsExceptCurrentUseCase implements ICommandHandler<DeleteAllSessionsExceptCurrentCommand> {
  constructor(
    @InjectModel(DeviceAuthSession.name)
    private readonly model: DeviceAuthSessionModel,
  ) {}

  async execute() {
    const res = await this.model.deleteMany({});
    return res.acknowledged;
  }
}
