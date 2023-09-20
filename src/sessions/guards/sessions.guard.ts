import { ConfigService } from '@nestjs/config';
import {
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { REDIS } from '../../redis/constants';
import { RedisClientType } from 'redis';
import { SessionsService } from '../sessions.service';

@Injectable()
export class SessionsGuard {
  constructor(
    private readonly config: ConfigService,
    private readonly sessionsService: SessionsService,
    @Inject(REDIS) private readonly redis: RedisClientType,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const session = await this.sessionsService.findById(request.session.id);
    if (!session) {
      throw new UnauthorizedException();
    }
    return session.userId === request.session.userId;
  }
}
