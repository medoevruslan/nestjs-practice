import { Module } from '@nestjs/common';
import { TestingController } from './api/testing.controller';

@Module({
  imports: [],
  controllers: [TestingController],
})
export class TestingModule {}
