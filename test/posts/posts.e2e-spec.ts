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
  let accessToken: string;

  const testUser = {
    login: 'test-user',
    email: 'test-user@email.com',
    password: '123456',
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
      .auth('admin', 'qwerty')
      .send(testBlog);

    expect(res.status).toBe(201);

    testBlogId = res.body.id;

    const response = await request(app.getHttpServer())
      .post('/api/users')
      .auth('admin', 'qwerty')
      .send(testUser)
      .expect(HttpStatus.CREATED);

    expect(response.body.login).toBe(testUser.login);
    expect(response.body.email).toBe(testUser.email);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ loginOrEmail: testUser.email, password: testUser.password })
      .expect(HttpStatus.OK);

    accessToken = loginResponse.body.accessToken;
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
      .auth('admin', 'qwerty')
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
      .auth('admin', 'qwerty')
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
      .auth('admin', 'qwerty')
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
      .auth('admin', 'qwerty')
      .send(newPost)
      .expect(HttpStatus.CREATED);

    const postId = resCreated.body.id;

    const resAll1 = await request(app.getHttpServer()).get('/api/posts');

    expect(resAll1.body.totalCount).toBe(3);

    await request(app.getHttpServer())
      .delete(`/api/posts/${postId}`)
      .auth('admin', 'qwerty')
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
      .auth('admin', 'qwerty')
      .send(newPost)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('should unauthorized on create post comment', async () => {
    const comment: CommentInputDto = { content: 'post-comment-content' };

    await request(app.getHttpServer())
      .post('/api/posts/1/comments')
      .send(comment)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('should create post comment', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ loginOrEmail: testUser.email, password: testUser.password })
      .expect(HttpStatus.OK);

    const newPost: CreatePostDto = {
      blogId: testBlogId,
      content: 'test-post-content',
      shortDescription: 'test-post-description',
      title: 'test-post-title',
    };

    const createdPostResponse = await request(app.getHttpServer())
      .post('/api/posts')
      .auth('admin', 'qwerty')
      .send(newPost)
      .expect(HttpStatus.CREATED);

    const postId = createdPostResponse.body.id;

    const postsRes = await request(app.getHttpServer()).get('/api/posts');

    expect(postsRes.body.totalCount).toBeGreaterThan(0);

    const comment: CommentInputDto = { content: 'post-comment-content' };

    await request(app.getHttpServer())
      .post(`/api/posts/${postId}/comments`)
      .send(comment)
      .auth(response.body.accessToken, { type: 'bearer' })
      .expect(HttpStatus.CREATED);

    const comments = await request(app.getHttpServer())
      .get(`/api/posts/${postId}/comments`)
      .expect(HttpStatus.OK);

    expect(comments.body).toHaveLength(1);
  });

  it('should update post like status and remove the like for None status', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ loginOrEmail: testUser.email, password: testUser.password })
      .expect(HttpStatus.OK);

    const createdPost = await request(app.getHttpServer())
      .post('/api/posts')
      .auth('admin', 'qwerty')
      .send({
        blogId: testBlogId,
        content: 'post for like-status test',
        shortDescription: 'like-status test post',
        title: 'post-like-status',
      })
      .expect(HttpStatus.CREATED);

    await request(app.getHttpServer())
      .put(`/api/posts/${createdPost.body.id}/like-status`)
      .auth(loginResponse.body.accessToken, { type: 'bearer' })
      .send({ likeStatus: 'Like' })
      .expect(HttpStatus.NO_CONTENT);

    const likedPost = await request(app.getHttpServer())
      .get(`/api/posts/${createdPost.body.id}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatus.OK);

    expect(likedPost.body.extendedLikesInfo.likesCount).toBe(1);
    expect(likedPost.body.extendedLikesInfo.dislikesCount).toBe(0);
    expect(likedPost.body.extendedLikesInfo.myStatus).toBe('Like');

    await request(app.getHttpServer())
      .put(`/api/posts/${createdPost.body.id}/like-status`)
      .auth(loginResponse.body.accessToken, { type: 'bearer' })
      .send({ likeStatus: 'None' })
      .expect(HttpStatus.NO_CONTENT);

    const unlikedPost = await request(app.getHttpServer())
      .get(`/api/posts/${createdPost.body.id}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(HttpStatus.OK);

    expect(unlikedPost.body.extendedLikesInfo.likesCount).toBe(0);
    expect(unlikedPost.body.extendedLikesInfo.myStatus).toBe('None');

    await request(app.getHttpServer())
      .put('/api/posts/507f1f77bcf86cd799439011/like-status')
      .auth(accessToken, { type: 'bearer' })
      .send({ likeStatus: 'Like' })
      .expect(HttpStatus.NOT_FOUND);
  });

  it('should update and delete only the authenticated user comment', async () => {
    const ownerLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ loginOrEmail: testUser.email, password: testUser.password })
      .expect(HttpStatus.OK);

    const anotherUser = {
      login: 'other-user',
      email: 'another-user@email.com',
      password: '123456',
    };

    await request(app.getHttpServer())
      .post('/api/users')
      .auth('admin', 'qwerty')
      .send(anotherUser)
      .expect(HttpStatus.CREATED);

    const anotherUserLogin = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ loginOrEmail: anotherUser.email, password: anotherUser.password })
      .expect(HttpStatus.OK);

    const createdPost = await request(app.getHttpServer())
      .post('/api/posts')
      .auth('admin', 'qwerty')
      .send({
        blogId: testBlogId,
        content: 'post for comment lifecycle test',
        shortDescription: 'comment lifecycle post',
        title: 'comment-lifecycle',
      })
      .expect(HttpStatus.CREATED);

    await request(app.getHttpServer())
      .post(`/api/posts/${createdPost.body.id}/comments`)
      .auth(ownerLogin.body.accessToken, { type: 'bearer' })
      .send({ content: 'initial comment content' })
      .expect(HttpStatus.CREATED);

    const comments = await request(app.getHttpServer())
      .get(`/api/posts/${createdPost.body.id}/comments`)
      .expect(HttpStatus.OK);
    const commentId = comments.body[0].id;

    await request(app.getHttpServer())
      .put(`/api/comments/${commentId}/like-status`)
      .auth(ownerLogin.body.accessToken, { type: 'bearer' })
      .send({ likeStatus: 'Dislike' })
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .put(`/api/comments/${commentId}`)
      .auth(anotherUserLogin.body.accessToken, { type: 'bearer' })
      .send({ content: 'updated comment content' })
      .expect(HttpStatus.FORBIDDEN);

    await request(app.getHttpServer())
      .put(`/api/comments/${commentId}`)
      .auth(ownerLogin.body.accessToken, { type: 'bearer' })
      .send({ content: 'updated comment content' })
      .expect(HttpStatus.NO_CONTENT);

    const updatedComment = await request(app.getHttpServer())
      .get(`/api/comments/${commentId}`)
      .auth(ownerLogin.body.accessToken, { type: 'bearer' })
      .expect(HttpStatus.OK);

    expect(updatedComment.body.content).toBe('updated comment content');
    expect(updatedComment.body.likesInfo.dislikesCount).toBe(1);
    expect(updatedComment.body.likesInfo.myStatus).toBe('Dislike');

    await request(app.getHttpServer())
      .delete(`/api/comments/${commentId}`)
      .auth(anotherUserLogin.body.accessToken, { type: 'bearer' })
      .expect(HttpStatus.FORBIDDEN);

    await request(app.getHttpServer())
      .delete(`/api/comments/${commentId}`)
      .auth(ownerLogin.body.accessToken, { type: 'bearer' })
      .expect(HttpStatus.NO_CONTENT);

    await request(app.getHttpServer())
      .get(`/api/comments/${commentId}`)
      .expect(HttpStatus.NOT_FOUND);
  });
});
