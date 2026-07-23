import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsStringWithTrim } from './decorators/validation/is-string-with-trim';
import { IsEnum, IsNumber, validateSync } from 'class-validator';

enum Environment {
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  TESTING = 'testing',
}

@Injectable()
export class CoreConfig {
  @IsNumber(undefined, { message: 'Please define port, ex.: 3000' })
  port: number = Number(this.configService.get('PORT'));

  @IsStringWithTrim(1)
  mongoUri: string = String(this.configService.get('MONGODB_URI'));

  @IsEnum(Environment)
  env: string = String(this.configService.get('NODE_ENV'));

  constructor(private readonly configService: ConfigService) {
    const valid = validateSync(this);
    if (valid.length) {
      const errors = valid.reduce<Record<string, string[]>>((err, val, idx) => {
        if (val.constraints) {
          err[val.property] = Object.entries(val.constraints).map(
            ([key, message]) => `${idx}) ${key}:: ${message}`,
          );
        }

        return err;
      }, {});
      throw new Error(
        `Invalid environment configuration:\n${JSON.stringify(errors, null, 2)}`,
      );
    }
  }
}
