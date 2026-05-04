import { INestApplication } from '@nestjs/common';
import { BaseExceptionFilter } from '../core/exceptions/base-exception.filter';

export function globalExceptionsSetup(app: INestApplication) {
  app.useGlobalFilters(new BaseExceptionFilter());
}
