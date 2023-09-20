import {
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { EnrichedSession, UserSession } from './interfaces';
import { SessionsGuard } from './guards/sessions.guard';
import { Session } from './decorators/session.decorator';
import { EnrichedSessionDto } from './dto/enriched-session.dto';
import {
  ForbiddenResponse,
  NotFoundResponse,
  UnauthorizedResponse,
} from '../components/swagger-responses';

@UseGuards(SessionsGuard)
@ApiTags('Sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionService: SessionsService) {}

  private checkSession(session: UserSession, userId: string) {
    switch (true) {
      case !session:
        throw new NotFoundException();
      case session.userId !== userId:
        throw new ForbiddenException();
      default:
        return session;
    }
  }

  @ApiOkResponse({
    description: '`Ok`',
    type: [EnrichedSessionDto],
  })
  @ApiUnauthorizedResponse({
    description: '`Unauthorized`',
    type: UnauthorizedResponse,
  })
  @Get()
  async list(@Session('userId') userId: string): Promise<EnrichedSession[]> {
    return this.sessionService
      .findAll(userId)
      .then((sessions) =>
        sessions.map((session) => SessionsService.enrich(session)),
      );
  }

  @ApiOkResponse({
    description: '`Ok`',
    type: EnrichedSessionDto,
  })
  @ApiForbiddenResponse({
    description: '`Forbidden`',
    type: ForbiddenResponse,
  })
  @ApiNotFoundResponse({
    description: '`Not Found`',
    type: NotFoundResponse,
  })
  @ApiUnauthorizedResponse({
    description: '`Unauthorized`',
    type: UnauthorizedResponse,
  })
  @Get(':id')
  async getById(
    @Param('id') id: string,
    @Session('userId') userId: string,
  ): Promise<EnrichedSession> {
    return this.sessionService
      .findById(id)
      .then((session) => this.checkSession(session, userId))
      .then((session) => SessionsService.enrich({ [id]: session }));
  }

  @ApiNoContentResponse({
    description: '`No Content`',
  })
  @ApiForbiddenResponse({
    description: '`Forbidden`',
    type: ForbiddenResponse,
  })
  @ApiNotFoundResponse({
    description: '`Not Found`',
    type: NotFoundResponse,
  })
  @ApiUnauthorizedResponse({
    description: '`Unauthorized`',
    type: UnauthorizedResponse,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Session('userId') userId: string,
  ): Promise<void> {
    return this.sessionService
      .findById(id)
      .then((session) => this.checkSession(session, userId))
      .then((session) => this.sessionService.delete(id, session.userId));
  }
}
