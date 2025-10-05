import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ParseObjectIdOrBadRequestPipe } from '../core/pipes/ParseObjectIdOrBadRequestPipe';

export function globalPipesSetup(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({ transform: true }),
    app.get(ParseObjectIdOrBadRequestPipe), // validate ObjectId globally
  );
}
