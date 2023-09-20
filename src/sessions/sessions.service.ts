import { Inject, Injectable, Scope } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { ConfigService } from '@nestjs/config';
import { EnrichedSession, UserSession } from './interfaces';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { REDIS } from '../redis/constants';
import { Logger } from '../components/logger';
import * as SESSION from './constants';
import * as UAParser from 'ua-parser-js';

@Injectable({ scope: Scope.REQUEST })
export class SessionsService {
  private readonly logger: Logger = new Logger(this.constructor.name);

  constructor(
    private readonly config: ConfigService,
    @Inject(REQUEST) private readonly req: Request,
    @Inject(REDIS) private readonly redis: RedisClientType,
  ) {}

  static enrich(session: Record<string, UserSession>): EnrichedSession {
    const key = Object.keys(session)[0];
    const ua = UAParser(session[key].userAgent);

    return {
      id: key,
      ip: session[key].ip,
      browser: ua.browser,
      device: ua.device,
      os: ua.os,
    };
  }

  async findById(id: string): Promise<UserSession | null> {
    return this.redis
      .get(this.config.get(SESSION.STORAGE_PREFIX) + id)
      .then((session) => JSON.parse(session));
  }

  async findAll(userId: string): Promise<Record<string, UserSession>[]> {
    const sessions = Object.keys(
      await this.redis.hGetAll(
        this.config.get(SESSION.STORAGE_USER_KEY) + userId,
      ),
    );
    const activeSessions = await this.redis.mGet(sessions);
    const toClean = [];
    const merged = sessions
      .map((key, idx) => {
        if (activeSessions[idx] !== null) {
          return {
            [key.replace(
              new RegExp(`^${this.config.get(SESSION.STORAGE_PREFIX)}`, 'g'),
              '',
            )]: JSON.parse(activeSessions[idx]),
          };
        }
        toClean.push(key);
      })
      .filter((session) => !!session);

    if (toClean.length > 0) {
      await this.redis.hDel(
        this.config.get(SESSION.STORAGE_USER_KEY) + userId,
        toClean,
      );
    }

    return merged as Record<string, UserSession>[];
  }

  async create(userId: string): Promise<string | void> {
    if (this.req.session['userId'] && this.req.session['userId'] !== userId) {
      return this.delete(this.req.session.id, userId).finally(() =>
        this.logger.warn(
          `Session [${this.req.session.id}] of user [${userId}] is compromised and destroyed`,
          'Create',
        ),
      );
    }

    Object.assign(this.req.session, {
      ip: this.req.ip,
      userId: userId,
      userAgent: this.req.headers['user-agent'],
    });

    return this.redis
      .hSet(
        this.config.get(SESSION.STORAGE_USER_KEY) + userId,
        this.config.get(SESSION.STORAGE_PREFIX) + this.req.session.id,
        +this.req.session.cookie.expires,
      )
      .then(() => this.req.session.id);
  }

  async delete(sessionId: string, userId: string): Promise<void> {
    await this.redis.del(this.config.get(SESSION.STORAGE_PREFIX) + sessionId);
    await this.redis.hDel(
      this.config.get(SESSION.STORAGE_USER_KEY) + userId,
      this.config.get(SESSION.STORAGE_PREFIX) + sessionId,
    );
  }
}
