import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePostDto } from '../../dto/update-post.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class UpdatePostCommand {
  constructor(
    public readonly id: string,
    public dto: UpdatePostDto,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(@InjectDataSource() private readonly dataSrc: DataSource) {}

  public async execute(command: UpdatePostCommand) {
    const { id, dto } = command;
    const [, affectedCount] = await this.dataSrc.query<
      [{ id: string }[], number]
    >(
      `UPDATE posts SET title = $1, short_description = $2, content = $3, blog_id = $4, updated_at = NOW() WHERE id=$5 RETURNING id::TEXT AS id`,
      [dto.title, dto.shortDescription, dto.content, dto.blogId, id],
    );
    return affectedCount === 1;
  }
}
