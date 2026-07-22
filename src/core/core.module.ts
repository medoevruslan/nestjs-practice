import { Global, Module } from '@nestjs/common';
import { ParseObjectIdOrBadRequestPipe } from './pipes/ParseObjectIdOrBadRequestPipe';
import { CoreConfig } from './core.config';

@Global()
@Module({
  providers: [ParseObjectIdOrBadRequestPipe, CoreConfig],
  exports: [ParseObjectIdOrBadRequestPipe, CoreConfig],
})
export class CoreModule { }
