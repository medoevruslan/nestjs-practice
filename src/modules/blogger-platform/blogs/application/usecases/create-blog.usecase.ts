import { CreateBlogDto } from '../../dto/create-blog.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class CreateBlogCommand {
  constructor(public readonly dto: CreateBlogDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<
  CreateBlogCommand,
  string
> {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async execute(command: CreateBlogCommand) {
    const { dto } = command;

    const [created] = await this.dataSource.query(
      `INSERT INTO blogs (name, website_url, description) values($1, $2, $3) RETURNING id::text as id `,
      [dto.name, dto.websiteUrl, dto.description],
    );

    return created.id;
  }
}
