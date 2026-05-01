import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { isValidObjectId, Types } from 'mongoose';

@Injectable()
export class ParseObjectIdOrBadRequestPipe implements PipeTransform<string> {
  transform(value: string, metadata: ArgumentMetadata) {
    const paramName = metadata.data ?? 'undefined param';
    if (metadata.metatype === Types.ObjectId && !isValidObjectId(value)) {
      throw new BadRequestException(`Invalid [${paramName}] format: ${value}`);
    }
    return value;
  }
}
