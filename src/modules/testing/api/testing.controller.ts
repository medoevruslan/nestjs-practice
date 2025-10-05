import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('testing')
export class TestingController {
  constructor(@InjectConnection() private connection: Connection) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    const collections = await this.connection.listCollections();

    await Promise.all(
      collections.map((collection) =>
        this.connection.collection(collection.name).deleteMany({}),
      ),
    );
  }
}
