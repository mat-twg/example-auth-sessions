import {
  Inject,
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { RedisModule } from '../redis/redis.module';
import { ConfigService } from '@nestjs/config';
import { REDIS, REDIS_DB } from '../redis/constants';
import { RedisClientType } from 'redis';
import * as session from 'express-session';
import RedisStore from 'connect-redis';
import * as SESSION from './constants';
import { Logger } from '../components/logger';

@Module({
  imports: [RedisModule],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule
  implements NestModule, OnModuleInit, OnModuleDestroy
{
  private readonly logger: Logger = new Logger(this.constructor.name);
  private subscriber: RedisClientType;

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

  async onModuleInit(): Promise<void> {
    const prefix = this.config.get(SESSION.STORAGE_PREFIX);
    const userKey = this.config.get(SESSION.STORAGE_USER_KEY);
    const shadowKey = this.config.get(SESSION.STORAGE_SHADOW_KEY);
    const dbName = this.config.get(REDIS_DB) || 0;

    await this.redis.configSet('notify-keyspace-events', 'Ex');

    this.subscriber = this.redis.duplicate();
    await this.subscriber.connect();
    await this.subscriber.subscribe(
      `__keyevent@${dbName}__:expired`,
      async (key: string) => {
        const sid = key.replace(new RegExp(`^${prefix}`, 'g'), '');
        const uid = await this.redis.get(shadowKey + sid);
        await Promise.all([
          this.redis.del(shadowKey + sid),
          this.redis.hDel(userKey + uid, key),
        ]);
        this.logger.log(`Session [${sid}] of user [${uid}] expired`, 'Expired');
      },
    );
  }

  async onModuleDestroy(): Promise<void> {
    await this.subscriber.quit();
  }
}
