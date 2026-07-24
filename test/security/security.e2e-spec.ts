import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/setup/app.setup';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('Security (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const builder = Test.createTestingModule({ imports: [AppModule] });
    const built = await builder.compile();
    app = built.createNestApplication();

    appSetup(app);
    await app.init();

    const connection = app.get<Connection>(getConnectionToken());

    if (!connection.db) {
      throw Error('Testing db is not available');
    }
  });

  afterAll(async () => {
    await app?.close();
  });

  it('should return device sessions empty list', async () => {
    const res = await request(app.getHttpServer()).get('/api/security/devices');

    expect(res.body.length).toBe(0);
  });
});
