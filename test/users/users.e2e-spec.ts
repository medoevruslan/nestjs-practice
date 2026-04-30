import {
  HttpStatus,
  INestApplication,
  NotFoundException,
} from '@nestjs/common';
import { Connection } from 'mongoose';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { getConnectionToken } from '@nestjs/mongoose';
import request from 'supertest';
import { appSetup } from '../../src/setup/app.setup';
import { RegisterUserInputDto } from '../../src/modules/auth/api/input-dto/register-user.input-dto';
import { AbstractEmailSender } from '../../src/modules/auth/application/port/abstract-email-sender';

const emailSenderMock = {
  sendEmailConfirmation: jest.fn().mockResolvedValue(undefined),
  sendPasswordRecovery: jest.fn().mockResolvedValue(undefined),
};

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
    })
      .overrideProvider(AbstractEmailSender)
      .useValue(emailSenderMock)
      .compile();

    app = moduleFixture.createNestApplication();
    appSetup(app);
    await app.init();

    const connection = moduleFixture.get<Connection>(getConnectionToken());

    if (!connection.db) throw new NotFoundException('Db is not available');

    await request(app.getHttpServer()).delete('/api/testing/all-data');

    const response = await request(app.getHttpServer())
      .post('/api/users')
      .send(testUser)
      .expect(HttpStatus.CREATED);

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
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body.message[0]).toBe(
      'password must be longer than or equal to 6 characters',
    );
  });

  it('should get user', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/users')
      .expect(HttpStatus.OK);

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
      .expect(HttpStatus.OK);

    expect(response.body.accessToken).toBeDefined();
  });

  it('should register user', async () => {
    const newUser: RegisterUserInputDto = {
      login: 'new-user',
      password: '1112223',
      email: 'fake@email.com',
    };

    await request(app.getHttpServer())
      .post('/api/auth/registration')
      .send(newUser)
      .expect(HttpStatus.OK);

    const emailSender = app.get(AbstractEmailSender);

    const usersResponse = await request(app.getHttpServer()).get('/api/users');
    expect(usersResponse.body.totalCount).toBe(2);
    expect(usersResponse.body.page).toBe(1);
    expect(usersResponse.body.pagesCount).toBe(1);
    expect(usersResponse.body.pageSize).toBe(10);
    expect(usersResponse.body.items.length).toBe(2);

    expect(emailSender.sendEmailConfirmation).toHaveBeenCalledTimes(1);
  });

  it('should not register user because email already exists, throw 400', async () => {
    const newUser: RegisterUserInputDto = testUser;

    const response = await request(app.getHttpServer())
      .post('/api/auth/registration')
      .send(newUser)
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body.message).toBe('User already exists');
    expect(emailSenderMock.sendEmailConfirmation).toHaveBeenCalledTimes(0);
  });

  it('should not login user because is not registered, throw 400', async () => {
    const newUser: RegisterUserInputDto = {
      login: 'unknown',
      email: 'unknown@unknown.com',
      password: 'unknown',
    };

    const res = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send(newUser)
      .expect(HttpStatus.NOT_FOUND);

    expect(res.body.message).toBe('Not Found');
  });
});
