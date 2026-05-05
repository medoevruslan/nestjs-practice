import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { DomainException } from '../exceptions/domain-exceptions';
import { DomainExceptionCode } from '../exceptions/domain-exception-codes';

@Injectable()
export class ParseObjectIdOrBadRequestPipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata) {
    const paramName = metadata.data ?? 'undefined param';
    if (!isValidObjectId(value)) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Invalid [${paramName}] format: ${value}`,
        extensions: [{ field: paramName, message: `Invalid ${paramName}` }],
      });
    }
    return value;
  }
}
