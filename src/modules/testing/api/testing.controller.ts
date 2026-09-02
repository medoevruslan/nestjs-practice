import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectConnection() private connection: Connection,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    const collections = await this.connection.listCollections();

    await Promise.all(
      collections.map((collection) =>
        this.connection.collection(collection.name).deleteMany({}),
      ),
    );

    // TODO: refactor once Entities would be added to the project
    const tables: { table_name: string }[] = await this.dataSource.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
`);

    for (const { table_name } of tables) {
      await this.dataSource.query(
        `TRUNCATE TABLE "${table_name}" RESTART IDENTITY CASCADE`,
      );
    }
  }
}
