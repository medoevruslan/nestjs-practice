import { INestApplication, NotFoundException } from '@nestjs/common';
import { Connection } from 'mongoose';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { getConnectionToken } from '@nestjs/mongoose';
import request from 'supertest';
import { appSetup } from '../../src/setup/app.setup';

describe('users test', () => {
  let app: INestApplication;
  let createdUserId: string;

  const testUser = {
    login: 'test-user',
    email: 'test-user@email.com',
    password: '123456',
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSetup(app);
    await app.init();

    const connection = moduleFixture.get<Connection>(getConnectionToken());

    if (!connection.db) throw new NotFoundException('Db is not available');

    await request(app.getHttpServer()).delete('/api/testing/all-data');

    const response = await request(app.getHttpServer())
      .post('/api/users')
      .send(testUser)
      .expect(201);

    expect(response.body.login).toBe('test-user');
    expect(response.body.email).toBe('test-user@email.com');

    createdUserId = response.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should not create user because password too short, throw 400', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/users')
      .send({
        login: 'test-user',
        email: 'test-user@email.com',
        password: '12345',
      })
      .expect(400);

    expect(response.body.message[0]).toBe(
      'password must be longer than or equal to 6 characters',
    );
  });

  it('should get user', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/users')
      .expect(200);

    expect(response.body.totalCount).toBe(1);
    expect(response.body.page).toBe(1);
    expect(response.body.pagesCount).toBe(1);
    expect(response.body.pageSize).toBe(10);
    expect(response.body.items.length).toBe(1);
    expect(response.body.items[0].id).toBe(createdUserId);
  });

  it('should auth successfully', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);

    expect(response.body.accessToken).toBeDefined();
  });
});
