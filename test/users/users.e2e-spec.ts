import { INestApplication, NotFoundException } from '@nestjs/common';
import { Connection } from 'mongoose';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { getConnectionToken } from '@nestjs/mongoose';
import request from 'supertest';
import { appSetup } from '../../src/setup/app.setup';

describe('users test', () => {
  let app: INestApplication;
  let connection: Connection;
  let createdUserId: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSetup(app);
    await app.init();

    connection = moduleFixture.get<Connection>(getConnectionToken());

    if (!connection.db) throw new NotFoundException('Db is not available');

    await request(app.getHttpServer()).delete('/api/testing/all-data');

    const response = await request(app.getHttpServer())
      .post('/api/users')
      .send({
        login: 'test-user',
        email: 'test-user@email.com',
        password: '123456',
      });

    expect(response.status).toBe(201);

    expect(response.body.login).toBe('test-user');
    expect(response.body.email).toBe('test-user@email.com');

    createdUserId = response.body.id;
  });

  afterAll(async () => {
    await app.close();
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
});
