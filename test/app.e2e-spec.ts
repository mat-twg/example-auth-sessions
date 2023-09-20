import { HttpServer, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { AppModule } from '../src/app.module';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { RedisClientType } from 'redis';

export let app: INestApplication;
export let connection: Connection;
export let httpServer: HttpServer;
export let testingModule: TestingModule;
export let redis: RedisClientType;

export function getModel<TModel>(token: string): Model<TModel> {
  return testingModule.get<Model<TModel>>(getModelToken(token));
}

beforeAll(async () => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});

  testingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = testingModule.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  await app.init();

  connection = testingModule.get<Connection>(getConnectionToken());
  httpServer = app.getHttpServer();
});

afterAll(async () => {
  await app.close();
});

it('NestApplication should be defined', () => {
  expect(app).toBeDefined();
});
