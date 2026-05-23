import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/setup/app.setup';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { DomainException } from '../../src/core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../src/core/exceptions/domain-exception-codes';
import request from 'supertest';
import { CreatePostDto } from '../../src/modules/blogger-platform/posts/dto/create-post.dto';
import { CreateBlogDto } from '../../src/modules/blogger-platform/blogs/dto/create-blog.dto';

describe('posts e2e tests', () => {
  let app: INestApplication;
  let testBlogId: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSetup(app);
    await app.init();

    const connection = moduleFixture.get<Connection>(getConnectionToken());

    if (!connection.db) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Db is not available',
      });
    }

    await request(app.getHttpServer()).delete('/api/testing/all-data');

    const testBlog: CreateBlogDto = {
      name: 'test-blog',
      description: 'test-blog-descripton',
      websiteUrl: 'test-blog-url.com',
    };

    const res = await request(app.getHttpServer())
      .post('/api/blogs')
      .send(testBlog);

    expect(res.status).toBe(201);

    testBlogId = res.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return empty posts list', async () => {
    const res = await request(app.getHttpServer()).get('/api/posts');
    expect(res.body.totalCount).toBe(0);
  });

  it('should create new post', async () => {
    const newPost: CreatePostDto = {
      blogId: testBlogId,
      content: 'test-post-content',
      shortDescription: 'test-post-description',
      title: 'test-post-title',
    };
  });
});
