import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/setup/app.setup';
import request from 'supertest';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { createTestUser, TEST_USER } from '../create-test-user';

describe('auth e2e tests', () => {
  let app: INestApplication;
  let accessToken: string = '';

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

    const res = await request(app.getHttpServer()).delete(
      '/api/testing/all-data',
    );
    expect(res.status).toBe(HttpStatus.NO_CONTENT);

    const response = await createTestUser(app.getHttpServer());

    expect(response.status).toBe(HttpStatus.CREATED);

    expect(response.body.login).toBe(TEST_USER.login);
    expect(response.body.email).toBe(TEST_USER.email);
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('auth rate limiter', () => {
    const REQUESTS_OVER_LIMIT = 6;
    const REQUESTS_PASSED = 5;

    it('should restrict more than 5 requests in 10 sec', async () => {
      for (let i = 0; i <= REQUESTS_OVER_LIMIT; i++) {
        const res = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({
            loginOrEmail: TEST_USER.email,
            password: TEST_USER.password,
          });

        if (accessToken === '') {
          accessToken = res.body.accessToken;
        }

        if (i < REQUESTS_PASSED) {
          expect(res.status).toBe(HttpStatus.OK);
        } else {
          expect(res.status).toBe(HttpStatus.TOO_MANY_REQUESTS);
        }
      }
    });

    it('me endpoint should not be restricted with rate limiter', async () => {
      for (let i = 0; i <= REQUESTS_OVER_LIMIT; i++) {
        const res = await request(app.getHttpServer())
          .get('/api/auth/me')
          .auth(accessToken, { type: 'bearer' });
        expect(res.status).toBe(HttpStatus.OK);
      }
    });
  });
});
