import { INestApplication } from '@nestjs/common';
import { globalPrefixSetup } from './global-prefix.setup';
import { swaggerSetup } from './swagger.setup';
import { globalPipesSetup } from './global-pipes.setup';

export function appSetup(app: INestApplication) {
  globalPipesSetup(app);
  globalPrefixSetup(app);
  swaggerSetup(app);
  app.enableCors();
}
