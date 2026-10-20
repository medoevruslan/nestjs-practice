import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { DataSource } from 'typeorm';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import {
  CreateDeviceAuthSessionCommand,
  CreateDeviceAuthSessionUseCase,
} from '../../src/modules/security/application/usecases/create-device-auth-session.usecase';
import { DeviceAuthSessionRepository } from '../../src/modules/security/infrastructure/device-auth-session.repository';
import { UsersService } from '../../src/modules/user-account/application/users.service';
import { UsersRepository } from '../../src/modules/user-account/infrastructure/users.repository';
import {
  User,
  UserSchema,
} from '../../src/modules/user-account/domain/user.entity';
import { CreateDeviceAuthSessionDomainDto } from '../../src/modules/security/domain/dto/create-device-auth-session.domain.dto';
import { DomainExceptionCode } from '../../src/core/exceptions/domain-exception-codes';
import { configModule } from '../../src/dynamic-config-module';
import { DatabaseConfig } from '../../src/database/database.config';

describe('CreateDeviceAuthSessionUseCase integration', () => {
  let testingModule: TestingModule | undefined;
  let mongoServer: MongoMemoryServer | undefined;
  let dataSource: DataSource;
  let useCase: CreateDeviceAuthSessionUseCase;
  let deviceAuthSessionRepository: DeviceAuthSessionRepository;

  const testUser = {
    email: 'security-integration@example.com',
    login: 'security-integration-user',
    password: 'password-hash',
  };
  const testDeviceId = 'security-integration-device';
  const missingUserId = '9223372036854775807';

  const createSession = (userId: string): CreateDeviceAuthSessionDomainDto => ({
    exp: Date.now() + 5000,
    ip: '127.0.0.1',
    deviceId: testDeviceId,
    deviceName: 'testDeviceName',
    iat: Date.now(),
    userId,
    refreshTokenHash:
      '$2b$10$hXuD/k6M8WL3QLTwwELkgeD3aws/0CKDOLz/7mySt.BFElC4wydze',
  });

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    testingModule = await Test.createTestingModule({
      imports: [
        configModule,
        TypeOrmModule.forRootAsync({ useClass: DatabaseConfig }),
        MongooseModule.forRoot(mongoServer.getUri()),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      providers: [
        UsersRepository,
        UsersService,
        DeviceAuthSessionRepository,
        CreateDeviceAuthSessionUseCase,
      ],
    }).compile();

    dataSource = testingModule.get<DataSource>(getDataSourceToken());
    useCase = testingModule.get(CreateDeviceAuthSessionUseCase);
    deviceAuthSessionRepository = testingModule.get(
      DeviceAuthSessionRepository,
    );

    await removeTestData();
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await removeTestData();
    }
    await testingModule?.close();
    await mongoServer?.stop();
  });

  it('should not create a device session when the user does not exist', async () => {
    await expect(
      useCase.execute(
        new CreateDeviceAuthSessionCommand(createSession(missingUserId)),
      ),
    ).rejects.toMatchObject({
      code: DomainExceptionCode.NotFound,
      message: 'User not found',
    });

    const [{ count }] = await dataSource.query<[{ count: number }]>(
      'SELECT COUNT(*)::int AS count FROM device_auth_session WHERE device_id = $1',
      [testDeviceId],
    );
    expect(count).toBe(0);
  });

  it('should create a device session for an existing user', async () => {
    const [{ id: userId }] = await dataSource.query<[{ id: string }]>(
      `
        INSERT INTO users (email, login, password)
        VALUES ($1, $2, $3)
        RETURNING id::text AS id
      `,
      [testUser.email, testUser.login, testUser.password],
    );
    const session = createSession(userId);

    await useCase.execute(new CreateDeviceAuthSessionCommand(session));

    const createdSession =
      await deviceAuthSessionRepository.getDeviceAuthSessionByDeviceIdOrFault(
        testDeviceId,
      );
    expect(createdSession).toMatchObject({
      userId,
      ip: session.ip,
      deviceId: session.deviceId,
      deviceName: session.deviceName,
      iat: session.iat.toString(),
      exp: session.exp.toString(),
      refreshTokenHash: session.refreshTokenHash,
    });
  });

  async function removeTestData() {
    await dataSource.query(
      'DELETE FROM device_auth_session WHERE device_id = $1',
      [testDeviceId],
    );
    await dataSource.query('DELETE FROM users WHERE email = $1', [
      testUser.email,
    ]);
  }
});
