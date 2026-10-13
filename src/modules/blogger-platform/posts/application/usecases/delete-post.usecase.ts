import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class DeletePostCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(@InjectDataSource() private readonly dataSrc: DataSource) {}

  async execute(command: DeletePostCommand) {
    const [, affectedCount] = await this.dataSrc.query<
      [{ id: string }[], number]
    >(
      `UPDATE posts SET deleted_at=NOW(), updated_at=NOW() WHERE id=$1 RETURNING id::TEXT AS id`,
      [command.id],
    );
    return affectedCount === 1;
  }
}
