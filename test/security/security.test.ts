import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  CreateDeviceAuthSessionCommand,
  CreateDeviceAuthSessionUseCase,
} from '../../src/modules/security/application/usecases/create-device-auth-session.usecase';
import { DeviceAuthSessionRepository } from '../../src/modules/auth/infrastructure/device-auth-session.repository';
import { CqrsModule } from '@nestjs/cqrs';
import {
  getConnectionToken,
  getModelToken,
  MongooseModule,
} from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import {
  DeviceAuthSession,
  DeviceAuthSessionSchema,
} from '../../src/modules/security/domain/device-auth-session.entity';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { DeviceAuthSessionQueryRepository } from '../../src/modules/auth/infrastructure/query/device-auth-session.query-repository';
import { UsersService } from '../../src/modules/user-account/application/users.service';
import { UsersRepository } from '../../src/modules/user-account/infrastructure/users.repository';
import {
  User,
  UserModelType,
  UserSchema,
} from '../../src/modules/user-account/domain/user.entity';
import { TEST_USER } from '../create-test-user';

describe('unit tests for security feature', () => {
  let app: INestApplication;
  let createDeviceAuthSessionUseCase: CreateDeviceAuthSessionUseCase;
  let mongoServerMemory: MongoMemoryServer;
  let deviceAuthSessionQueryRepository: DeviceAuthSessionQueryRepository;
  let userModel: UserModelType;

  beforeAll(async () => {
    mongoServerMemory = await MongoMemoryServer.create();

    const builder = Test.createTestingModule({
      imports: [
        CqrsModule,
        MongooseModule.forRoot(mongoServerMemory.getUri()),
        MongooseModule.forFeature([
          { name: DeviceAuthSession.name, schema: DeviceAuthSessionSchema },
          { name: User.name, schema: UserSchema },
        ]),
      ],
      providers: [
        UsersService,
        UsersRepository,
        CreateDeviceAuthSessionUseCase,
        DeviceAuthSessionRepository,
        DeviceAuthSessionQueryRepository,
      ],
    });

    const built = await builder.compile();
    app = built.createNestApplication();

    const connection = app.get<Connection>(getConnectionToken());

    if (!connection.db) {
      throw Error('Testing db is not available');
    }

    createDeviceAuthSessionUseCase = app.get(CreateDeviceAuthSessionUseCase);
    deviceAuthSessionQueryRepository = app.get(
      DeviceAuthSessionQueryRepository,
    );
    userModel = app.get<UserModelType>(getModelToken(User.name));
  });

  afterAll(async () => {
    await mongoServerMemory.stop();
    await app?.close();
  });

  const session = {
    exp: Date.now() + 5000,
    ip: 'test::ip',
    deviceId: 'testDeviceId',
    deviceName: 'testDeviceName',
    iat: Date.now(),
    userId: new Types.ObjectId(),
  };

  it.failing(
    'should not create device session because user is not exists',
    async () => {
      await createDeviceAuthSessionUseCase.execute(
        new CreateDeviceAuthSessionCommand(session),
      );

      const res = await deviceAuthSessionQueryRepository.getAll();

      expect(res.length).toBe(0);
    },
  );

  it('should create device session for existing user', async () => {
    const user = userModel.createInstance(TEST_USER);
    await user.save();

    await createDeviceAuthSessionUseCase.execute(
      new CreateDeviceAuthSessionCommand({ ...session, userId: user.id }),
    );

    const res = await deviceAuthSessionQueryRepository.getAll();

    expect(res.length).toBe(1);
  });
});
