import { INestApplication } from '@nestjs/common';
import { globalPrefixSetup } from './global-prefix.setup';
import { swaggerSetup } from './swagger.setup';
import { globalPipesSetup } from './global-pipes.setup';
import cookieParser from 'cookie-parser';

export function appSetup(app: INestApplication) {
  globalPipesSetup(app);
  globalPrefixSetup(app);
  swaggerSetup(app);
  app.enableCors();
  app.use(cookieParser());

  const express = app.getHttpAdapter().getInstance();
  express.set('trust proxy', true);
}
