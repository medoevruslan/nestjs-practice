import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { isValidObjectId, Types } from 'mongoose';
import { DomainException } from '../exceptions/domain-exceptions';
import { DomainExceptionCode } from '../exceptions/domain-exception-codes';

@Injectable()
export class ParseObjectIdOrBadRequestPipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata) {
    const paramName = metadata.data ?? 'undefined param';
    if (metadata.metatype === Types.ObjectId && !isValidObjectId(value)) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Invalid [${paramName}] format: ${value}`,
      });
    }
    return value;
  }
}
