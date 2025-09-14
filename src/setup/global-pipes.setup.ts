import { INestApplication, ValidationPipe } from '@nestjs/common';

export function globalPipesSetup(app: INestApplication) {
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
}
