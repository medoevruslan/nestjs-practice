import { configModule } from './dynamic-config-module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BloggerPlatformModule } from './modules/blogger-platform/blogger-platform.module';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountModule } from './modules/user-account/user-account.module';
import { TestingModule } from './modules/testing/testing.module';
import { CoreModule } from './core/core.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_FILTER } from '@nestjs/core';
import { DomainExceptionFilter } from './core/exceptions/domain-exception.filter';
import { AllHttpExceptionsFilter } from './core/exceptions/base-exception.filter';
import { CoreConfig } from './core/core.config';
import { SecurityModule } from './modules/security/security.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateAuthTables1757000000000 } from './database/migrations/1757000000000-create-auth-tables';

@Module({
  imports: [
    configModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      autoLoadEntities: false,
      synchronize: false,
      migrations: [CreateAuthTables1757000000000],
      migrationsRun: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: (coreConfig: CoreConfig) => {
        return { uri: coreConfig.mongoUri };
      },
      inject: [CoreConfig],
    }),
    BloggerPlatformModule,
    UserAccountModule,
    TestingModule,
    CoreModule,
    AuthModule,
    SecurityModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: AllHttpExceptionsFilter },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
  ],
})
export class AppModule {}
