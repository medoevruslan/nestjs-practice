import request from 'supertest';
import { Server } from 'node:https';
import { RegisterUserInputDto } from '../src/modules/auth/api/input-dto/register-user.input-dto';

export const TEST_USER = Object.freeze({
  login: 'test-user',
  email: 'test-user@email.com',
  password: '123456',
});

export const createTestUser = async (
  app: Server,
): Promise<request.Response> => {
  return request(app)
    .post('/api/users')
    .auth('admin', 'qwerty')
    .send(TEST_USER);
};

export const loginTestUser = (
  app: Server,
  override?: RegisterUserInputDto,
): Promise<request.Response> => {
  const payload = override ?? TEST_USER;
  return request(app)
    .post('/api/auth/login')
    .send({ loginOrEmail: payload.email, password: payload.password });
};
