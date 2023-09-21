import { Inject, Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { REDIS } from './constants';
import { createClient, RedisClientType } from 'redis';
import { ConfigService } from '@nestjs/config';
import * as process from 'process';

const env = process.env;

@Module({
  providers: [
    {
      provide: REDIS,
      useFactory: () => {
        return createClient({
          url:
            env.REDIS_URI ||
            `redis://${env.REDIS_HOST}:${env.REDIS_PORT}/${env.REDIS_DB}`,
        });
      },
    },
  ],
  exports: [REDIS],
})
export class RedisModule implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly config: ConfigService,
    @Inject(REDIS) private readonly redis: RedisClientType,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.redis.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}
