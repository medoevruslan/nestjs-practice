import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { IsBoolean, IsEnum, IsNumber, validateSync } from 'class-validator';
import { IsStringWithTrim } from 'src/core/decorators/validation/is-string-with-trim';
import { Nullable } from 'src/shared/common.types';
import { CreateAuthTables1757000000000 } from './migrations/1757000000000-create-auth-tables';
import { CreateBlogsTable1791292568321 } from './migrations/1791292568321-CreateBlogsTable';
import { CreatePostsTable1791465379156 } from './migrations/1791465379156-CreatePostsTable';

enum Environment {
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  TESTING = 'testing',
}

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
  databaseUrl: Nullable<string> =
    this.configService.get<string>('DATABASE_URL')?.trim() ?? null;

  @IsEnum(Environment)
  env: string = String(this.configService.get('NODE_ENV'));

  @IsBoolean()
  isProduction: boolean = this.env === Environment.PRODUCTION;

  @IsStringWithTrim(1)
  host: string = this.configService.get<string>('PGHOST') ?? 'localhost';

  @IsNumber(undefined, { message: 'Please define port, ex.: 5432' })
  port: number = Number(this.configService.get<string>('PGPORT') ?? 5432);

  @IsStringWithTrim(1)
  username: string = this.configService.get<string>('PGUSER') ?? 'postgres';

  @IsStringWithTrim(1)
  password: string = this.configService.get<string>('PGPASSWORD') ?? 'postgres';

  @IsStringWithTrim(1)
  database: string = this.configService.get<string>('PGDATABASE') ?? 'postgres';

  private defaultOptions = {
    type: 'postgres' as const,
    autoLoadEntities: false,
    synchronize: false,
    migrations: [
      CreateAuthTables1757000000000,
      CreateBlogsTable1791292568321,
      CreatePostsTable1791465379156,
    ],
    migrationsRun: true,
  };

  constructor(@Inject() private readonly configService: ConfigService) {
    const validationErrors = validateSync(this);
    if (validationErrors.length) {
      const errors = validationErrors.reduce<Record<string, string[]>>(
        (err, val, idx) => {
          if (val.constraints) {
            err[val.property] = Object.entries(val.constraints).map(
              ([key, message]) => `${idx}) ${key}:: ${message}`,
            );
          }

          return err;
        },
        {},
      );
      throw new Error(
        `Invalid environment configuration:\n${JSON.stringify(errors, null, 2)}`,
      );
    }
  }

  createTypeOrmOptions() {
    if (this.databaseUrl) {
      return {
        url: this.databaseUrl,
        ssl: this.isProduction ? { rejectUnauthorized: false } : undefined,
        ...this.defaultOptions,
      };
    }

    return {
      host: this.host,
      port: this.port,
      username: this.username,
      password: this.password,
      database: this.database,
      ...this.defaultOptions,
    };
  }
}
