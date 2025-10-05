import { Module } from '@nestjs/common';
import { ParseObjectIdOrBadRequestPipe } from './pipes/ParseObjectIdOrBadRequestPipe';

@Module({
  providers: [ParseObjectIdOrBadRequestPipe],
  exports: [ParseObjectIdOrBadRequestPipe],
})
export class CoreModule {}
