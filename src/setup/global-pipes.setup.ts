import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import {
  DomainException,
  Extensions,
} from '../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../core/exceptions/domain-exception-codes';

export function globalPipesSetup(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
      exceptionFactory: (err) => {
        const extensions = mapToDomainExtensions(err);
        throw new DomainException({
          code: DomainExceptionCode.ValidationError,
          message: 'Validation error',
          extensions,
        });
      },
    }),
  );
}

const mapToDomainExtensions = (errors: ValidationError[]) => {
  const mappedExtensions: Extensions[] = [];
  for (const error of errors) {
    const constraints = error.constraints;
    if (constraints) {
      for (const constraint in constraints) {
        mappedExtensions.push({
          field: error.property,
          message: constraints[constraint],
        });
      }
      continue;
    }
    mappedExtensions.push({ field: error.property, message: 'Invalid value' });
  }
  return mappedExtensions;
};
