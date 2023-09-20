import * as request from 'supertest';
import { getModel, httpServer } from './app.e2e-spec';
import { User } from '../src/users/schemas/user.schema';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import { EnrichedSession } from '../src/sessions/interfaces';

describe('SessionsController', () => {
  const users: User[] = [];
  const cookies: any = [];
  const sessions: EnrichedSession[] = [];

  afterAll(async () => {
    const model = getModel<User>(User.name);
    await model.deleteMany({});
  });

  const payload: CreateUserDto = {
    email: '1@2.ru',
    password: '12345678',
  };

  describe('Prepare:', () => {
    it('201 - Created: first user', () => {
      return request(httpServer)
        .post('/sign-up')
        .send(payload)
        .expect(201)
        .expect((response) => {
          users.push(response.body);
        });
    });

    it('201 - Created: second user', () => {
      payload.email = '1@3.ru';
      return request(httpServer)
        .post('/sign-up')
        .send(payload)
        .expect(201)
        .expect((response) => {
          users.push(response.body);
        });
    });

    it('200 - Ok: first sign in and get sess cookie', () => {
      payload.email = users[0].email;
      return request(httpServer)
        .post('/sign-in')
        .send(payload)
        .expect(200)
        .expect((response) => {
          cookies.push(response.headers['set-cookie']);
        });
    });

    it('200 - Ok: second sign in and get sess cookie', () => {
      payload.email = users[1].email;
      return request(httpServer)
        .post('/sign-in')
        .send(payload)
        .expect(200)
        .expect((response) => {
          cookies.push(response.headers['set-cookie']);
        });
    });
  });

  describe('List: /sessions (GET)', () => {
    it('200 - Ok: first sessions list', () => {
      return request(httpServer)
        .get('/sessions')
        .set('Cookie', cookies[0])
        .send()
        .expect(200)
        .expect((response) => {
          sessions.push(...response.body);
        });
    });

    it('200 - Ok: second sessions list', () => {
      return request(httpServer)
        .get('/sessions')
        .set('Cookie', cookies[1])
        .send()
        .expect(200)
        .expect((response) => {
          sessions.push(...response.body);
        });
    });

    it('401 - Unauthorized: try without sess cookie', () => {
      return request(httpServer).get('/sessions').send().expect(401);
    });
  });

  describe('GetById: /sessions/:id (GET)', () => {
    it('200 - Ok: first get session', () => {
      return request(httpServer)
        .get('/sessions/' + sessions[0].id)
        .set('Cookie', cookies[0])
        .send()
        .expect(200);
    });

    it('404 - Not Found: first try get session with fake id', () => {
      return request(httpServer)
        .get('/sessions/fake_id')
        .set('Cookie', cookies[0])
        .send()
        .expect(404);
    });

    it('403 - Forbidden: second try get session of first', () => {
      return request(httpServer)
        .get('/sessions/' + sessions[0].id)
        .set('Cookie', cookies[1])
        .send()
        .expect(403);
    });

    it('401 - Unauthorized: try without sess cookie', () => {
      return request(httpServer).get('/sessions').send().expect(401);
    });
  });

  describe('Delete: /sessions/:id (DELETE)', () => {
    it('403 - Forbidden: second try delete session of first', () => {
      return request(httpServer)
        .delete('/sessions/' + sessions[0].id)
        .set('Cookie', cookies[1])
        .send()
        .expect(403);
    });

    it('204 - No Content: first delete active session, i.e.: sign-out', () => {
      return request(httpServer)
        .delete('/sessions/' + sessions[0].id)
        .set('Cookie', cookies[0])
        .send()
        .expect(204);
    });

    it('401 - Unauthorized: first try delete session again', () => {
      return request(httpServer)
        .delete('/sessions/' + sessions[0].id)
        .set('Cookie', cookies[0])
        .send()
        .expect(401);
    });

    it('404 - Not Found: second try delete non existing session of first', () => {
      return request(httpServer)
        .get('/sessions/' + sessions[0].id)
        .set('Cookie', cookies[1])
        .send()
        .expect(404);
    });

    it('401 - Unauthorized: try without sess cookie', () => {
      return request(httpServer).get('/sessions').send().expect(401);
    });
  });
});
