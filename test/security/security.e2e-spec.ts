import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/setup/app.setup';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { createTestUser, loginTestUser } from '../create-test-user';

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

    const resetAllRes = await request(app.getHttpServer()).delete(
      '/api/testing/all-data',
    );

    expect(resetAllRes.status).toBe(HttpStatus.NO_CONTENT);

    const createdRes = await createTestUser(app.getHttpServer());

    expect(createdRes.status).toBe(HttpStatus.CREATED);
  });

  afterAll(async () => {
    await app?.close();
  });

  it('should return device sessions empty list', async () => {
    const loginRes = await loginTestUser(app.getHttpServer());
    expect(loginRes.status).toBe(HttpStatus.OK);
    expect(loginRes.body.accessToken).toBeDefined();

    const res = await request(app.getHttpServer())
      .get('/api/security/devices')
      .auth(loginRes.body.accessToken, { type: 'bearer' });

    expect(res.body.length).toBe(0);
  });

  it('should create device session on login', async () => {});
  it('should delete all sessions on request', async () => {});
  it('should delete session by id on request', async () => {});
});
