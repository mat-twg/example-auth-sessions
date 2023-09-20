import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { REDIS, REDIS_URL } from './constants';
import { createClient, RedisClientType } from 'redis';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    {
      provide: REDIS,
      useFactory: (config: ConfigService) => {
        return createClient({
          url: config.get(REDIS_URL),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS],
})
export class RedisModule implements OnModuleInit {
  constructor(@Inject(REDIS) private readonly redis: RedisClientType) {}

  async onModuleInit(): Promise<void> {
    await this.redis.connect();
  }
}
