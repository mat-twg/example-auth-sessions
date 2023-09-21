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

  private readonly prefix: string;
  private readonly userKey: string;
  private readonly shadowKey: string;

  constructor(
    private readonly config: ConfigService,
    @Inject(REQUEST) private readonly req: Request,
    @Inject(REDIS) private readonly redis: RedisClientType,
  ) {
    this.prefix = config.get(SESSION.STORAGE_PREFIX);
    this.userKey = config.get(SESSION.STORAGE_USER_KEY);
    this.shadowKey = config.get(SESSION.STORAGE_SHADOW_KEY);
  }

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
      .get(this.prefix + id)
      .then((session) => JSON.parse(session));
  }

  async findAll(userId: string): Promise<Record<string, UserSession>[]> {
    const sessions = Object.keys(
      await this.redis.hGetAll(this.userKey + userId),
    );
    const activeSessions = await this.redis.mGet(sessions);
    const toClean = [];
    const merged = sessions
      .map((key, idx) => {
        if (activeSessions[idx] !== null) {
          return {
            [key.replace(new RegExp(`^${this.prefix}`, 'g'), '')]: JSON.parse(
              activeSessions[idx],
            ),
          };
        }
        toClean.push(key);
      })
      .filter((session) => !!session);

    if (toClean.length > 0) {
      await Promise.all(
        toClean.map((del) =>
          this.redis.del(
            del.replace(new RegExp(`^${this.prefix}`, 'g'), this.shadowKey),
          ),
        ),
      );
      await this.redis.hDel(this.userKey + userId, toClean);
    }
    return merged as Record<string, UserSession>[];
  }

  async create(userId: string): Promise<string | void> {
    if (this.req.session['userId'] && this.req.session['userId'] !== userId) {
      return this.delete(
        this.req.session.id,
        this.req.session['userId'],
      ).finally(() =>
        this.logger.warn(
          `User [${userId}] suspicious activities: session [${this.req.session.id}] of user [${this.req.session['userId']}] is compromised and destroyed`,
          'Create',
        ),
      );
    }

    Object.assign(this.req.session, {
      ip: this.req.ip,
      userId: userId,
      userAgent: this.req.headers['user-agent'],
    });

    await this.redis.set(this.shadowKey + this.req.session.id, userId);
    await this.redis.hSet(
      this.userKey + userId,
      this.prefix + this.req.session.id,
      +this.req.session.cookie.expires,
    );
    return this.req.session.id;
  }

  async delete(sessionId: string, userId: string): Promise<void> {
    const sid = this.prefix + sessionId;
    const uid = this.userKey + userId;

    await Promise.all([
      this.redis.del(this.shadowKey + sessionId),
      this.redis.del(sid),
      this.redis.hDel(uid, sid),
    ]);
  }
}
