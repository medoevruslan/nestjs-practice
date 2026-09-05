import { HttpStatus, INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import request from 'supertest';
import { appSetup } from '../../src/setup/app.setup';
import { RegisterUserInputDto } from '../../src/modules/auth/api/input-dto/register-user.input-dto';
import { AbstractEmailSender } from '../../src/modules/auth/application/port/abstract-email-sender';
import { PasswordRecoveryInputDto } from '../../src/modules/auth/api/input-dto/password-recovery-input.dto';
import { NewPasswordDto } from '../../src/modules/auth/dto/new-password.dto';
import {
  User,
  UserModelType,
} from '../../src/modules/user-account/domain/user.entity';
import bcrypt from 'bcrypt';
import { DomainException } from '../../src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../src/core/exceptions/domain-exception-codes';
import { createTestUser, loginTestUser, TEST_USER } from '../create-test-user';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { UserSqlRow } from 'src/modules/user-account/infrastructure/mappers/user.mapper';

const emailSenderMock = {
  sendEmailConfirmation: jest.fn().mockResolvedValue(undefined),
  sendPasswordRecovery: jest.fn().mockResolvedValue(undefined),
};

describe('users test', () => {
  let app: INestApplication;
  let testUserId: string;
  let userModel: UserModelType;
  let dataSource: DataSource;

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
    userModel = moduleFixture.get<UserModelType>(getModelToken(User.name));
    dataSource = moduleFixture.get<DataSource>(getDataSourceToken());

    if (!connection.db)
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Db is not available',
      });

    await request(app.getHttpServer()).delete('/api/testing/all-data');

    const response = await createTestUser(app.getHttpServer());
    expect(response.status).toBe(HttpStatus.CREATED);

    expect(response.body.login).toBe(TEST_USER.login);
    expect(response.body.email).toBe(TEST_USER.email);

    testUserId = response.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should not create user because password too short, throw 400', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/sa/users')
      .auth('admin', 'qwerty')
      .send({
        ...TEST_USER,
        password: '12345',
      })
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body.errorsMessages.length).toBeGreaterThan(0);

    expect(response.body.errorsMessages[0].field).toBe('password');
    expect(response.body.errorsMessages[0].message).toBe(
      'password must be longer than or equal to 6 characters',
    );
  });

  it('should get user', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/sa/users')
      .expect(HttpStatus.OK);

    expect(response.body.totalCount).toBe(1);
    expect(response.body.page).toBe(1);
    expect(response.body.pagesCount).toBe(1);
    expect(response.body.pageSize).toBe(10);
    expect(response.body.items.length).toBe(1);
    expect(response.body.items[0].id).toBe(testUserId);
  });

  it('should login successfully', async () => {
    const response = await loginTestUser(app.getHttpServer());

    expect(response.status).toBe(HttpStatus.OK);

    expect(response.body.accessToken).toBeDefined();
  });

  // order of tests is important, because of emailSenderMock
  it('should not register user because email already exists, throw 400', async () => {
    const newUser: RegisterUserInputDto = TEST_USER;

    const response = await request(app.getHttpServer())
      .post('/api/auth/registration')
      .send(newUser)
      .expect(HttpStatus.BAD_REQUEST);

    expect(response.body.errorsMessages.length).toBeGreaterThan(0);
    expect(response.body.errorsMessages[0].field).toBe('login');
    expect(emailSenderMock.sendEmailConfirmation).toHaveBeenCalledTimes(0);
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
      .expect(HttpStatus.NO_CONTENT);

    const emailSender = app.get(AbstractEmailSender);

    const usersResponse = await request(app.getHttpServer()).get(
      '/api/sa/users/',
    );
    expect(usersResponse.body.totalCount).toBe(2);
    expect(usersResponse.body.page).toBe(1);
    expect(usersResponse.body.pagesCount).toBe(1);
    expect(usersResponse.body.pageSize).toBe(10);
    expect(usersResponse.body.items.length).toBe(2);

    expect(emailSender.sendEmailConfirmation).toHaveBeenCalledTimes(1);
  });

  it('should not login user because is not registered, throw 400', async () => {
    const newUser: RegisterUserInputDto = {
      login: 'unknown',
      email: 'unknown@unknown.com',
      password: 'unknown',
    };

    const res = await loginTestUser(app.getHttpServer(), newUser);
    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);

    expect(res.body.errorsMessages.length).toBeGreaterThan(0);
    expect(res.body.errorsMessages[0].message).toBe('Invalid credentials');
  });

  it('should not recover password because user not unauthorized', async () => {
    const user: PasswordRecoveryInputDto = { email: 'fake@fake.com' };

    await request(app.getHttpServer())
      .post('/api/auth/password-recovery')
      .send(user)
      .expect(HttpStatus.NO_CONTENT);

    expect(emailSenderMock.sendPasswordRecovery).toHaveBeenCalledTimes(0);
  });

  it('should recover password', async () => {
    const user: PasswordRecoveryInputDto = { email: TEST_USER.email };
    await request(app.getHttpServer())
      .post('/api/auth/password-recovery')
      .send(user)
      .expect(HttpStatus.NO_CONTENT);

    expect(emailSenderMock.sendPasswordRecovery).toHaveBeenCalledTimes(1);
  });

  it('should not set new password, because fake user', async () => {
    const body: NewPasswordDto = {
      password: '123456',
      code: 'fake-code',
    };

    const res = await request(app.getHttpServer())
      .post('/api/auth/new-password')
      .send(body)
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body.errorsMessages.length).toBeGreaterThan(0);
    expect(res.body.errorsMessages[0].message).toBe(
      'Recovery code is invalid or expired',
    );
  });

  it('should not set new password, because of expiration date', async () => {
    const user: PasswordRecoveryInputDto = { email: TEST_USER.email };
    await request(app.getHttpServer())
      .post('/api/auth/password-recovery')
      .send(user)
      .expect(HttpStatus.NO_CONTENT);

    const newPass = '12345678';

    const code = emailSenderMock.sendPasswordRecovery.mock.lastCall[1];
    const body: NewPasswordDto = {
      password: newPass,
      code,
    };

    const pastDate = new Date(Date.now() - 1000);

    await dataSource.query(
      'UPDATE users SET confirmation_code_expiration = $1 WHERE id = $2 AND deleted_at IS NULL',
      [pastDate, testUserId],
    );

    const res = await request(app.getHttpServer())
      .post('/api/auth/new-password')
      .send(body)
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body.errorsMessages.length).toBeGreaterThan(0);
    expect(res.body.errorsMessages[0].message).toBe(
      'Recovery code is invalid or expired',
    );
  });

  it('should set new password', async () => {
    const user: PasswordRecoveryInputDto = { email: TEST_USER.email };
    await request(app.getHttpServer())
      .post('/api/auth/password-recovery')
      .send(user)
      .expect(HttpStatus.NO_CONTENT);

    const newPass = '12345678';

    const code = emailSenderMock.sendPasswordRecovery.mock.lastCall[1];
    const body: NewPasswordDto = {
      password: newPass,
      code,
    };

    await request(app.getHttpServer())
      .post('/api/auth/new-password')
      .send(body)
      .expect(HttpStatus.NO_CONTENT);

    const [storedUser] = await dataSource.query<UserSqlRow[]>(
      'SELECT * FROM users WHERE id=$1 AND deleted_at IS NULL',
      [testUserId],
    );
    const res = await bcrypt.compare(newPass, storedUser!.password);
    expect(res).toBe(true);
  });

  it('should get me if user is authorized', async () => {
    const response = await loginTestUser(app.getHttpServer());

    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body.accessToken).toBeDefined();

    const res = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${response.body.accessToken}`)
      .expect(HttpStatus.OK);

    expect(res.body.userId).toBe(testUserId);
    expect(res.body.login).toBe(TEST_USER.login);
    expect(res.body.email).toBe(TEST_USER.email);
  });

  it('should not get me if user is not authorized', async () => {
    const response = await loginTestUser(app.getHttpServer());

    expect(response.body.accessToken).toBeDefined();

    await request(app.getHttpServer())
      .get('/api/auth/me')
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should not confirm user because of bad code', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/auth/registration-confirmation')
      .send({ email: TEST_USER.email, code: 'fake-code' })
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body.errorsMessages.length).toBeGreaterThan(0);
    expect(res.body.errorsMessages[0].message).toBe(
      'Confirmation code is invalid or expired',
    );
  });

  it('should not confirm user because of expiration date', async () => {
    const confirmationCode = 'code';

    await dataSource.query(
      'UPDATE users SET email_confirmation_code=$1, confirmation_code_expiration=$2 WHERE id=$3 AND deleted_at IS NULL',
      [confirmationCode, new Date(Date.now() - 1000), testUserId],
    );

    const res = await request(app.getHttpServer())
      .post('/api/auth/registration-confirmation')
      .send({ email: TEST_USER.email, code: confirmationCode })
      .expect(HttpStatus.BAD_REQUEST);

    expect(res.body.errorsMessages.length).toBeGreaterThan(0);
    expect(res.body.errorsMessages[0].message).toBe(
      'Confirmation code is invalid or expired',
    );
  });

  it('should confirm user', async () => {
    const confirmationCode = 'code';

    await dataSource.query(
      'UPDATE users SET email_confirmation_code=$1, confirmation_code_expiration=$2 WHERE id=$3 AND deleted_at IS NULL',
      [confirmationCode, new Date(Date.now() + 10000), testUserId],
    );

    await request(app.getHttpServer())
      .post('/api/auth/registration-confirmation')
      .send({ email: TEST_USER.email, code: confirmationCode })
      .expect(HttpStatus.NO_CONTENT);

    const [confirmedUser] = await dataSource.query<UserSqlRow[]>(
      'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
      [testUserId],
    );

    expect(confirmedUser!.is_email_confirmed).toBe(true);
    expect(confirmedUser!.confirmation_code_expiration).toBe(null);
  });

  it('should not delete user, because not authorized', async () => {
    await request(app.getHttpServer())
      .delete(`/api/sa/users/${testUserId}`)
      .set('Authorization', `Basic ${testUserId}`)
      .expect(HttpStatus.UNAUTHORIZED);

    const res = await request(app.getHttpServer()).get('/api/sa/users');
    expect(res.body.totalCount).toBe(2);
  });

  it('should not delete user', async () => {
    await request(app.getHttpServer())
      .delete(`/api/sa/users/${testUserId}`)
      .auth('admin', `qwerty`)
      .expect(HttpStatus.NO_CONTENT);

    const res = await request(app.getHttpServer()).get('/api/sa/users');
    expect(res.body.totalCount).toBe(1);
  });
});
