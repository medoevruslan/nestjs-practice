import { HttpStatus, INestApplication } from '@nestjs/common';
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
import { UpdatePostDto } from '../../src/modules/blogger-platform/posts/dto/update-post.dto';
import { CommentInputDto } from '../../src/modules/blogger-platform/shared/api/input-dto/comment.input-dto';

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
      websiteUrl: 'https://test-blog-url.com',
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

    await request(app.getHttpServer())
      .post('/api/posts')
      .send(newPost)
      .expect(201);

    const res = await request(app.getHttpServer()).get('/api/posts');
    expect(res.body.totalCount).toBe(1);
  });

  it('should update post', async () => {
    const newPost: CreatePostDto = {
      blogId: testBlogId,
      content: 'test-post-content',
      shortDescription: 'test-post-description',
      title: 'test-post-title',
    };
    const resCreated = await request(app.getHttpServer())
      .post('/api/posts')
      .send(newPost)
      .expect(HttpStatus.CREATED);

    const postId = resCreated.body.id;

    const updatePost: UpdatePostDto = {
      blogId: testBlogId,
      content: 'updated-post-content',
      shortDescription: 'updated-post-description',
      title: 'updated-post-title',
    };

    await request(app.getHttpServer())
      .put(`/api/posts/${postId}`)
      .send(updatePost)
      .expect(HttpStatus.NO_CONTENT);

    const resAll = await request(app.getHttpServer()).get('/api/posts');

    const updatedFromResult = resAll.body.items.find(
      (item) => item.id === postId,
    );

    expect(resAll.body.totalCount).toBe(2);
    expect(updatedFromResult).toMatchObject(updatePost);
  });

  it('should delete post', async () => {
    const newPost: CreatePostDto = {
      blogId: testBlogId,
      content: 'test-post-content',
      shortDescription: 'test-post-description',
      title: 'test-post-title',
    };
    const resCreated = await request(app.getHttpServer())
      .post('/api/posts')
      .send(newPost)
      .expect(HttpStatus.CREATED);

    const postId = resCreated.body.id;

    const resAll1 = await request(app.getHttpServer()).get('/api/posts');

    expect(resAll1.body.totalCount).toBe(3);

    await request(app.getHttpServer())
      .delete(`/api/posts/${postId}`)
      .expect(HttpStatus.NO_CONTENT);

    const resAll2 = await request(app.getHttpServer()).get('/api/posts');

    expect(resAll2.body.totalCount).toBe(2);
  });

  it('should not create post because blog not found, throw 400', async () => {
    const newPost: CreatePostDto = {
      blogId: 'fake-id',
      content: 'test-post-content',
      shortDescription: 'test-post-description',
      title: 'test-post-title',
    };

    await request(app.getHttpServer())
      .post('/api/posts')
      .send(newPost)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('should create post comment', async () => {
    const comment: CommentInputDto = { content: 'post-comment-content' };

    await request(app.getHttpServer())
      .post('/api/posts/1/comments')
      .send(comment)
      .expect(HttpStatus.CREATED);

    const comments = await request(app.getHttpServer()).get(
      '/api/posts/1/comments',
    );
    expect(comments.body.totalCount).toBe(1);
  });
});
