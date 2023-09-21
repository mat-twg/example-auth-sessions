import * as request from 'supertest';
import { getModel, httpServer } from './app.e2e-spec';
import { User } from '../src/users/schemas/user.schema';
import { CreateUserDto } from '../src/users/dto/create-user.dto';

describe('AppController', () => {
  const users: User[] = [];

  afterAll(async () => {
    const model = getModel<User>(User.name);
    await model.deleteMany({});
  });

  const payload: CreateUserDto = {
    email: '1@2.ru',
    password: '12345678',
  };

  describe('Sign up: /sign-up (POST)', () => {
    it('201 - Created: first', () => {
      return request(httpServer)
        .post('/sign-up')
        .send(payload)
        .expect(201)
        .expect((response) => {
          users.push(response.body);
        });
    });

    it('201 - Created: second', () => {
      payload.email = '1@3.ru';
      return request(httpServer)
        .post('/sign-up')
        .send(payload)
        .expect(201)
        .expect((response) => {
          users.push(response.body);
        });
    });

    it('400 - Bad request: empty', () => {
      return request(httpServer).post('/sign-up').send({}).expect(400);
    });

    it('400 - Bad request: invalid email', () => {
      return request(httpServer)
        .post('/sign-up')
        .send({ email: 'fake', password: '12345678' })
        .expect(400);
    });

    it('400 - Bad request: invalid password', () => {
      return request(httpServer)
        .post('/sign-up')
        .send({ email: 'fake', password: '123' })
        .expect(400);
    });

    it('422 - Unprocessable Entity: duplicated', () => {
      return request(httpServer).post('/sign-up').send(payload).expect(422);
    });
  });

  describe('Sign in: /sign-in (POST)', () => {
    let cookie: any;

    it('401 - Unauthorized: user not found with passed credentials', () => {
      payload.email = 'fake@email.ru';
      return request(httpServer).post('/sign-in').send(payload).expect(401);
    });

    it('200 - Ok: first get sess cookie', () => {
      payload.email = users[0].email;
      return request(httpServer)
        .post('/sign-in')
        .send(payload)
        .expect(200)
        .expect((response) => {
          cookie = response.headers['set-cookie'];
        });
    });

    it('409 - Conflict: second try sign in as first (compromised cookie)', () => {
      payload.email = users[1].email;
      return request(httpServer)
        .post('/sign-in')
        .set('Cookie', cookie[0])
        .send(payload)
        .expect(409);
    });

    it('400 - Bad Request: credentials input error', () => {
      payload.password = '123';
      return request(httpServer).post('/sign-in').send(payload).expect(400);
    });
  });

  describe('Sign out: /sign-out (POST)', () => {
    let cookie: any;

    it('200 - Ok: sign in and get sess cookie', () => {
      payload.email = users[0].email;
      payload.password = '12345678';

      return request(httpServer)
        .post('/sign-in')
        .send(payload)
        .expect(200)
        .expect((response) => {
          cookie = response.headers['set-cookie'];
        });
    });

    it('204 - No Content: user with sess cookie signed out', () => {
      return request(httpServer)
        .post('/sign-out')
        .set('Cookie', cookie[0])
        .send()
        .expect(204);
    });

    it('401 - Unauthorized: try with expired cookie', () => {
      return request(httpServer)
        .post('/sign-out')
        .set('Cookie', cookie[0])
        .send()
        .expect(401);
    });

    it('401 - Unauthorized: try without sess cookie', () => {
      return request(httpServer).post('/sign-out').send().expect(401);
    });
  });
});
