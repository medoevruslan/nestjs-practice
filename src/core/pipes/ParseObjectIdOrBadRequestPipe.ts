import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class ParseObjectIdOrBadRequestPipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata) {
    const paramName = metadata.data ?? 'undefined param';
    if (!isValidObjectId(value)) {
      throw new BadRequestException(`Invalid [${paramName}] format: ${value}`);
    }
    return value;
  }
}
