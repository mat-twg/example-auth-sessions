import {
  Inject,
  MiddlewareConsumer,
  Module,
  NestModule,
  OnApplicationShutdown,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { REDIS } from './redis/constants';
import { RedisModule } from './redis/redis.module';
import { RedisClientType } from 'redis';
import RedisStore from 'connect-redis';
import * as session from 'express-session';
import * as process from 'process';
import { UsersModule } from './users/users.module';
import { SessionsModule } from './sessions/sessions.module';
import * as SESSION from './sessions/constants';

const env = process.env;

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      `mongodb://${env.MONGO_USERNAME}:${env.MONGO_PASSWORD}@mongo.${env.HOST}:${env.MONGO_PORT}/`,
      { dbName: env.MONGO_DB },
    ),
    RedisModule,
    UsersModule,
    SessionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule, OnApplicationShutdown {
  constructor(
    private readonly config: ConfigService,
    @Inject(REDIS) private readonly redis: RedisClientType,
  ) {}

  async configure(consumer: MiddlewareConsumer): Promise<void> {
    consumer
      .apply(
        session({
          store: new RedisStore({
            client: this.redis,
            prefix: this.config.get(SESSION.STORAGE_PREFIX),
          }),
          saveUninitialized: false,
          secret: this.config.get(SESSION.SECRET),
          resave: false,
          rolling: true,
          cookie: {
            secure: this.config.get(SESSION.COOKIE_SECURE) === 'true',
            httpOnly: this.config.get(SESSION.COOKIE_HTTPONLY) === 'true',
            maxAge: this.config.get(SESSION.COOKIE_MAX_AGE) * 1000,
          },
        }),
      )
      .forRoutes('*');
  }

  async onApplicationShutdown(): Promise<void> {
    await this.redis.quit();
  }
}
