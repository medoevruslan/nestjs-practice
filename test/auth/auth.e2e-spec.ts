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
  });

  afterAll(async () => {
    await app?.close();
  });

  describe('auth login and logout', () => {
    let accessToken: string;
    let refreshToken: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer()).delete(
        '/api/testing/all-data',
      );
      expect(res.status).toBe(HttpStatus.NO_CONTENT);

      const response = await createTestUser(app.getHttpServer());

      expect(response.status).toBe(HttpStatus.CREATED);

      expect(response.body.login).toBe(TEST_USER.login);
      expect(response.body.email).toBe(TEST_USER.email);
    });

    it('should login successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          loginOrEmail: TEST_USER.email,
          password: TEST_USER.password,
        });

      expect(res.status).toBe(HttpStatus.OK);
      accessToken = res.body.accessToken;
      refreshToken = res.headers['set-cookie'][0];
    });

    it('should logout restricted if no auth', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should logout and delete auth session', async () => {
      // remove all sessions except current
      await request(app.getHttpServer())
        .delete('/api/security/devices')
        .auth(accessToken, { type: 'bearer' })
        .set('Cookie', refreshToken)
        .expect(HttpStatus.NO_CONTENT);

      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .auth(accessToken, { type: 'bearer' })
        .set('Cookie', refreshToken)
        .expect(HttpStatus.NO_CONTENT);

      const securityRes = await request(app.getHttpServer())
        .get('/api/security/devices')
        .auth(accessToken, { type: 'bearer' })
        .set('Cookie', refreshToken)
        .expect(HttpStatus.OK);

      expect(securityRes.body.length).toBe(0);
    });
  });

  describe('auth rate limiter', () => {
    const RATE_LIMIT = 5;
    const REQUEST_COUNT = RATE_LIMIT + 1;
    const RATE_LIMIT_TEST_IP = '198.51.100.42';
    let accessToken: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer()).delete(
        '/api/testing/all-data',
      );
      expect(res.status).toBe(HttpStatus.NO_CONTENT);

      const response = await createTestUser(app.getHttpServer());

      expect(response.status).toBe(HttpStatus.CREATED);

      expect(response.body.login).toBe(TEST_USER.login);
      expect(response.body.email).toBe(TEST_USER.email);
    });

    it('should restrict more than 5 requests in 10 sec', async () => {
      for (let i = 0; i < REQUEST_COUNT; i++) {
        const res = await request(app.getHttpServer())
          .post('/api/auth/login')
          .set('X-Forwarded-For', RATE_LIMIT_TEST_IP)
          .send({
            loginOrEmail: TEST_USER.email,
            password: TEST_USER.password,
          });

        if (i < RATE_LIMIT) {
          expect(res.status).toBe(HttpStatus.OK);
        } else {
          expect(res.status).toBe(HttpStatus.TOO_MANY_REQUESTS);
        }

        if (res.status === HttpStatus.OK && !accessToken) {
          accessToken = res.body.accessToken;
        }
      }
    });

    it('me endpoint should not be restricted with rate limiter', async () => {
      for (let i = 0; i < REQUEST_COUNT; i++) {
        const res = await request(app.getHttpServer())
          .get('/api/auth/me')
          .auth(accessToken, { type: 'bearer' });
        expect(res.status).toBe(HttpStatus.OK);
      }
    });
  });
});
