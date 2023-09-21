import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionsService } from '../sessions.service';

@Injectable()
export class SessionsGuard {
  constructor(private readonly sessionsService: SessionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const session = await this.sessionsService.findById(request.session.id);
    if (!session) {
      throw new UnauthorizedException();
    }
    return session.userId === request.session?.userId;
  }
}
