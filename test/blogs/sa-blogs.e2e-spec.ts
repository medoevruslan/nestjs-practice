import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/setup/app.setup';

describe('super admin blogs e2e tests', () => {
  let app: INestApplication;
  let blogId: string;
  let postId: string;

  const blog = {
    name: 'sa-test-blog',
    description: 'Blog created through the super admin API',
    websiteUrl: 'https://sa-blog.example.com',
  };

  const post = {
    title: 'super admin post',
    shortDescription: 'Post created through the super admin API',
    content: 'Content created through the super admin API',
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    appSetup(app);
    await app.init();

    await request(app.getHttpServer())
      .delete('/api/testing/all-data')
      .expect(HttpStatus.NO_CONTENT);
  });

  afterAll(async () => {
    await app?.close();
  });

  it('should protect super admin blog endpoints with Basic authentication', async () => {
    await request(app.getHttpServer())
      .get('/api/sa/blogs')
      .expect(HttpStatus.UNAUTHORIZED);

    await request(app.getHttpServer())
      .post('/api/sa/blogs')
      .send(blog)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should create and list blogs', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/sa/blogs')
      .auth('admin', 'qwerty')
      .send(blog)
      .expect(HttpStatus.CREATED);

    blogId = created.body.id;
    expect(created.body).toMatchObject(blog);

    const blogs = await request(app.getHttpServer())
      .get('/api/sa/blogs')
      .auth('admin', 'qwerty')
      .expect(HttpStatus.OK);

    expect(blogs.body.totalCount).toBe(1);
    expect(blogs.body.items[0]).toMatchObject({ id: blogId, ...blog });
  });

  it('should update a blog', async () => {
    const update = {
      name: 'updated-blog',
      description: 'Updated through the super admin API',
      websiteUrl: 'https://updated-sa-blog.example.com',
    };

    await request(app.getHttpServer())
      .put(`/api/sa/blogs/${blogId}`)
      .auth('admin', 'qwerty')
      .send(update)
      .expect(HttpStatus.NO_CONTENT);

    const found = await request(app.getHttpServer())
      .get(`/api/blogs/${blogId}`)
      .expect(HttpStatus.OK);

    expect(found.body).toMatchObject(update);
  });

  it('should create and list posts for a blog', async () => {
    const created = await request(app.getHttpServer())
      .post(`/api/sa/blogs/${blogId}/posts`)
      .auth('admin', 'qwerty')
      .send(post)
      .expect(HttpStatus.CREATED);

    postId = created.body.id;
    expect(created.body).toMatchObject({ ...post, blogId });
    expect(created.body.blogName).toBe('updated-blog');

    const posts = await request(app.getHttpServer())
      .get(`/api/sa/blogs/${blogId}/posts`)
      .auth('admin', 'qwerty')
      .expect(HttpStatus.OK);

    expect(posts.body.totalCount).toBe(1);
    expect(posts.body.items[0]).toMatchObject({ id: postId, ...post, blogId });
  });

  it('should update only a post that belongs to the specified blog', async () => {
    const update = {
      title: 'updated admin post',
      shortDescription: 'Post updated through the super admin API',
      content: 'Updated content through the super admin API',
    };

    await request(app.getHttpServer())
      .put(`/api/sa/blogs/${blogId}/posts/${postId}`)
      .auth('admin', 'qwerty')
      .send(update)
      .expect(HttpStatus.NO_CONTENT);

    const found = await request(app.getHttpServer())
      .get(`/api/posts/${postId}`)
      .expect(HttpStatus.OK);

    expect(found.body).toMatchObject({ id: postId, ...update, blogId });

    const anotherBlog = await request(app.getHttpServer())
      .post('/api/sa/blogs')
      .auth('admin', 'qwerty')
      .send({
        name: 'another-blog',
        description: 'Another blog for ownership validation',
        websiteUrl: 'https://another-blog.example.com',
      })
      .expect(HttpStatus.CREATED);

    await request(app.getHttpServer())
      .put(`/api/sa/blogs/${anotherBlog.body.id}/posts/${postId}`)
      .auth('admin', 'qwerty')
      .send(update)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should delete a post and a blog', async () => {
    await request(app.getHttpServer())
      .delete(`/api/sa/blogs/${blogId}/posts/${postId}`)
      .auth('admin', 'qwerty')
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .get(`/api/posts/${postId}`)
      .expect(HttpStatus.NOT_FOUND);

    await request(app.getHttpServer())
      .delete(`/api/sa/blogs/${blogId}`)
      .auth('admin', 'qwerty')
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .get(`/api/blogs/${blogId}`)
      .expect(HttpStatus.NOT_FOUND);
  });
});
