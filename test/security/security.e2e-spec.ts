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
  let accessToken: string;

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

  beforeEach(async () => {
    const loginRes = await loginTestUser(app.getHttpServer());
    expect(loginRes.status).toBe(HttpStatus.OK);
    expect(loginRes.body.accessToken).toBeDefined();

    accessToken = loginRes.body.accessToken;
  });

  afterEach(async () => {
    await cleanUpSessions(app, accessToken);
  });

  afterAll(async () => {
    await app?.close();
  });

  it('should create device session on login', async () => {
    const deviceAuthRes = await request(app.getHttpServer())
      .get('/api/security/devices')
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatus.OK);

    expect(deviceAuthRes.body.length).toBe(1);
  });

  it('should delete all sessions on request', async () => {
    const deviceAuthRes1 = await request(app.getHttpServer())
      .get('/api/security/devices')
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatus.OK);

    expect(deviceAuthRes1.body.length).toBe(1);

    await request(app.getHttpServer())
      .delete('/api/security/devices')
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatus.NO_CONTENT);

    const deviceAuthRes2 = await request(app.getHttpServer())
      .get('/api/security/devices')
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatus.OK);

    expect(deviceAuthRes2.body.length).toBe(0);
  });

  it('should delete session by id on request', async () => {
    const deviceAuthRes1 = await request(app.getHttpServer())
      .get('/api/security/devices')
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatus.OK);

    expect(deviceAuthRes1.body.length).toBe(1);

    const deviceId = deviceAuthRes1.body[0].deviceId;

    await request(app.getHttpServer())
      .delete(`/api/security/devices/${deviceId}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatus.NO_CONTENT);

    const deviceAuthRes2 = await request(app.getHttpServer())
      .get(`/api/security/devices`)
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatus.OK);

    expect(deviceAuthRes2.body.length).toBe(0);
  });
});

const cleanUpSessions = async (app: INestApplication, token: string) => {
  await request(app.getHttpServer())
    .delete('/api/security/devices')
    .auth(token, { type: 'bearer' })
    .expect(HttpStatus.NO_CONTENT);
};
