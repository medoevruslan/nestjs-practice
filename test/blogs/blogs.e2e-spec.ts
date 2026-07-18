import { HttpStatus, INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection } from 'mongoose';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { CreateBlogDto } from '../../src/modules/blogger-platform/blogs/dto/create-blog.dto';
import { UpdateBlogDto } from '../../src/modules/blogger-platform/blogs/dto/update-blog.dto';
import { appSetup } from '../../src/setup/app.setup';

describe('blogs e2e tests', () => {
  let app: INestApplication;
  let blogId: string;
  let accessToken: string;

  const createdBlog: CreateBlogDto = {
    name: 'test-blog',
    description: 'Blog created by e2e test',
    websiteUrl: 'https://test-blog.example.com',
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSetup(app);
    await app.init();

    const connection = moduleFixture.get<Connection>(getConnectionToken());
    if (!connection.db) {
      throw new Error('Test database is not available');
    }

    await request(app.getHttpServer())
      .delete('/api/testing/all-data')
      .expect(HttpStatus.NO_CONTENT);

    const user = {
      login: 'blog-user',
      email: 'blog-user@example.com',
      password: '123456',
    };

    await request(app.getHttpServer())
      .post('/api/users')
      .auth('admin', 'qwerty')
      .send(user)
      .expect(HttpStatus.CREATED);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ loginOrEmail: user.email, password: user.password })
      .expect(HttpStatus.OK);

    accessToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app?.close();
  });

  it('should create a blog and return it by id', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/blogs')
      .send(createdBlog)
      .expect(HttpStatus.CREATED);

    blogId = createResponse.body.id;
    expect(createResponse.body).toMatchObject(createdBlog);

    const getResponse = await request(app.getHttpServer())
      .get(`/api/blogs/${blogId}`)
      .expect(HttpStatus.OK);

    expect(getResponse.body).toMatchObject({ id: blogId, ...createdBlog });
  });

  it('should return blogs with pagination and search', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/blogs')
      .query({ searchNameTerm: 'test-blog' })
      .expect(HttpStatus.OK);

    expect(response.body.totalCount).toBe(1);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].id).toBe(blogId);
  });

  it('should update a blog', async () => {
    const updateDto: UpdateBlogDto = {
      name: 'updated-blog',
      description: 'Updated blog description',
      websiteUrl: 'https://updated-blog.example.com',
    };

    await request(app.getHttpServer())
      .put(`/api/blogs/${blogId}`)
      .auth(accessToken, { type: 'bearer' })
      .send(updateDto)
      .expect(HttpStatus.NO_CONTENT);

    const response = await request(app.getHttpServer())
      .get(`/api/blogs/${blogId}`)
      .expect(HttpStatus.OK);

    expect(response.body).toMatchObject(updateDto);
  });

  it('should create and return posts of a specified blog', async () => {
    const post = {
      title: 'blog post',
      shortDescription: 'Post created for blog endpoint test',
      content: 'Post content created for blog endpoint test',
    };

    const createResponse = await request(app.getHttpServer())
      .post(`/api/blogs/${blogId}/posts`)
      .auth(accessToken, { type: 'bearer' })
      .send(post)
      .expect(HttpStatus.CREATED);

    expect(createResponse.body).toMatchObject({ ...post, blogId });

    const getResponse = await request(app.getHttpServer())
      .get(`/api/blogs/${blogId}/posts`)
      .expect(HttpStatus.OK);

    expect(getResponse.body.totalCount).toBe(1);
    expect(getResponse.body.items[0]).toMatchObject({ ...post, blogId });
  });

  it('should delete a blog and return 404 afterwards', async () => {
    await request(app.getHttpServer())
      .delete(`/api/blogs/${blogId}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .get(`/api/blogs/${blogId}`)
      .expect(HttpStatus.NOT_FOUND);
  });
});
