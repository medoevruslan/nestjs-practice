import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import {
  DeviceAuthSession,
  DeviceAuthSessionModel,
} from '../../domain/device-auth-session.entity';
import { Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtUserPayload } from '../../../auth/jwtUserPayload';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { DeviceAuthSessionService } from '../device-auth-session.service';

export class DeleteAllSessionsExceptCurrentCommand {
  constructor(readonly refreshToken: string) {}
}

@CommandHandler(DeleteAllSessionsExceptCurrentCommand)
export class DeleteAllSessionsExceptCurrentUseCase implements ICommandHandler<DeleteAllSessionsExceptCurrentCommand> {
  constructor(
    @InjectModel(DeviceAuthSession.name)
    private readonly model: DeviceAuthSessionModel,
    @Inject() private readonly jwtService: JwtService,
    @Inject()
    private readonly deviceAuthSessionService: DeviceAuthSessionService,
  ) {}

  async execute(command: DeleteAllSessionsExceptCurrentCommand) {
    try {
      const { deviceId, id: userId } = this.jwtService.verify<JwtUserPayload>(
        command.refreshToken,
      );

      await this.deviceAuthSessionService.validateRefreshTokenForSession(
        deviceId,
        command.refreshToken,
      );

      const res = await this.model.updateMany(
        { userId, deviceId: { $ne: deviceId }, deletedAt: null },
        { $set: { deletedAt: new Date() } },
      );
      return res.acknowledged;
    } catch (e) {
      // TODO: add production logger
      console.error(
        'bad request toke on DeleteAllSessionsExceptCurrentCommand',
        e,
      );
      throw new DomainException({
        code: DomainExceptionCode.Unauthorized,
        message: 'Invalid authorization data',
      });
    }
  }
}
