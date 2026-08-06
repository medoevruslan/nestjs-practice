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
  let refreshToken: string;

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

  beforeEach(async () => {
    const resetRes = await request(app.getHttpServer()).delete(
      '/api/testing/all-data',
    );

    expect(resetRes.status).toBe(HttpStatus.NO_CONTENT);

    const createdRes = await createTestUser(app.getHttpServer());
    expect(createdRes.status).toBe(HttpStatus.CREATED);

    const loginRes = await loginTestUser(app.getHttpServer());
    expect(loginRes.status).toBe(HttpStatus.OK);

    accessToken = loginRes.body.accessToken;
    refreshToken = loginRes.headers['set-cookie'][0];
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

  it('should delete all sessions on request except current', async () => {
    const deviceAuthRes1 = await request(app.getHttpServer())
      .get('/api/security/devices')
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatus.OK);

    expect(deviceAuthRes1.body.length).toBe(1);

    await request(app.getHttpServer())
      .delete('/api/security/devices')
      .auth(accessToken, { type: 'bearer' })
      .set('Cookie', refreshToken)
      .expect(HttpStatus.NO_CONTENT);

    const deviceAuthRes2 = await request(app.getHttpServer())
      .get('/api/security/devices')
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatus.OK);

    expect(deviceAuthRes2.body.length).toBe(1);
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
