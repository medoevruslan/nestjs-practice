import { Global, Module } from '@nestjs/common';
import { ParseObjectIdOrBadRequestPipe } from './pipes/ParseObjectIdOrBadRequestPipe';
import { CoreConfig } from './core.config';
import { ParseRelationalIdOrBadRequestPipe } from './pipes/parse-relational-id-or-bad-request.pipe';

@Global()
@Module({
  providers: [
    ParseObjectIdOrBadRequestPipe,
    ParseRelationalIdOrBadRequestPipe,
    CoreConfig,
  ],
  exports: [
    ParseObjectIdOrBadRequestPipe,
    ParseRelationalIdOrBadRequestPipe,
    CoreConfig,
  ],
})
export class CoreModule {}
