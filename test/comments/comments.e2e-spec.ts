import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { AppModule } from 'src/app.module';
import { appSetup } from 'src/setup/app.setup';
import { DataSource } from 'typeorm';
import request from 'supertest';
import { CreateBlogDto } from 'src/modules/blogger-platform/blogs/dto/create-blog.dto';
import { CreatePostDto } from 'src/modules/blogger-platform/posts/dto/create-post.dto';
import { createTestUser, loginTestUser } from '../create-test-user';

describe('test comments', () => {
  let app: INestApplication;
  let dataSrc: DataSource;
  let testPostId: number;
  let accessToken: string;

  beforeAll(async () => {
    const fixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = fixture.createNestApplication();
    appSetup(app);

    await app.init();

    dataSrc = app.get<DataSource>(getDataSourceToken());

    if (!dataSrc.isInitialized) {
      throw Error('Db is not initialized');
    }

    try {
      await dataSrc.query('SELECT 1');
    } catch (e) {
      throw Error('Db is not available');
    }

    await request(app.getHttpServer())
      .delete('/api/testing/all-data')
      .expect(HttpStatus.NO_CONTENT);

    const createdRes = await createTestUser(app.getHttpServer());
    expect(createdRes.status).toBe(HttpStatus.CREATED);

    const loginRes = await loginTestUser(app.getHttpServer());
    expect(loginRes.status).toBe(HttpStatus.OK);

    accessToken = loginRes.body.accessToken;

    const testBlog: CreateBlogDto = {
      name: 'test-blog',
      description: 'test-blog-descripton',
      websiteUrl: 'https://test-blog-url.com',
    };

    const res = await request(app.getHttpServer())
      .post('/api/blogs')
      .auth('admin', 'qwerty')
      .send(testBlog);

    expect(res.status).toBe(HttpStatus.CREATED);

    const testBlogId = res.body.id;

    const newPost: CreatePostDto = {
      blogId: testBlogId,
      content: 'test-post-content',
      shortDescription: 'test-post-description',
      title: 'test-post-title',
    };

    const createPostRes = await request(app.getHttpServer())
      .post('/api/posts')
      .auth('admin', 'qwerty')
      .send(newPost);

    expect(createPostRes.status).toBe(HttpStatus.CREATED);

    testPostId = createPostRes.body.id;
  });

  afterAll(async () => {
    await app?.close();
  });

  it('should return comments list', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/posts/${testPostId}/comments`)
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatus.OK);

    expect(res.body.totalCount).toBe(0);
  });

  it('should return comments in the requested sort direction', async () => {
    const comments = [
      'first comment content',
      'second comment content',
      'third comment content',
    ];
    const createdCommentIds: string[] = [];

    for (const content of comments) {
      const createCommentRes = await request(app.getHttpServer())
        .post(`/api/posts/${testPostId}/comments`)
        .auth(accessToken, { type: 'bearer' })
        .send({ content })
        .expect(HttpStatus.CREATED);

      createdCommentIds.push(createCommentRes.body.id);
    }

    const ascendingRes = await request(app.getHttpServer())
      .get(`/api/posts/${testPostId}/comments`)
      .query({ sortDirection: 'ASC' })
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatus.OK);

    expect(ascendingRes.body.totalCount).toBe(comments.length);
    expect(ascendingRes.body.items.map(({ id }: { id: string }) => id)).toEqual(
      createdCommentIds,
    );

    const descendingRes = await request(app.getHttpServer())
      .get(`/api/posts/${testPostId}/comments`)
      .query({ sortDirection: 'DESC' })
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatus.OK);

    expect(descendingRes.body.totalCount).toBe(comments.length);
    expect(
      descendingRes.body.items.map(({ id }: { id: string }) => id),
    ).toEqual([...createdCommentIds].reverse());
  });
});
