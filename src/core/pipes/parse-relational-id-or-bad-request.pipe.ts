import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { DomainException } from '../exceptions/domain-exceptions';
import { DomainExceptionCode } from '../exceptions/domain-exception-codes';

@Injectable()
export class ParseRelationalIdOrBadRequestPipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata) {
    const paramName = metadata.data ?? 'undefined param';

    if (!/^[1-9]\d*$/.test(value)) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Invalid [${paramName}] format: ${value}`,
        extensions: [{ field: paramName, message: `Invalid ${paramName}` }],
      });
    }

    return value;
  }
}
