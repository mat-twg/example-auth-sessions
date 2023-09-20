import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { CreateUserDto } from './users/dto/create-user.dto';
import { LoginUserDto } from './users/dto/login-user.dto';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { SessionsGuard } from './sessions/guards/sessions.guard';
import { Request } from 'express';
import { DuplicateKeyInterceptor } from './components/duplicate-key.interceptor';
import {
  BadRequestResponse,
  ConflictResponse,
  UnauthorizedResponse,
  UnprocessableEntityResponse,
} from './components/swagger-responses';
import { User } from './users/schemas/user.schema';

@ApiTags('Default')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiCreatedResponse({
    description: '`Created`',
    type: User,
  })
  @ApiBadRequestResponse({
    description: '`Bad Request`',
    type: BadRequestResponse,
  })
  @ApiUnprocessableEntityResponse({
    description: '`Unprocessable Entity`',
    type: UnprocessableEntityResponse,
  })
  @UseInterceptors(DuplicateKeyInterceptor)
  @Post('sign-up')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.appService.signUp(createUserDto);
  }

  @ApiOkResponse({
    description: '`Ok`',
    type: User,
  })
  @ApiBadRequestResponse({
    description: '`Bad Request`',
    type: BadRequestResponse,
  })
  @ApiUnauthorizedResponse({
    description: '`Unauthorized`',
    type: UnauthorizedResponse,
  })
  @ApiConflictResponse({
    description: '`Conflict`',
    type: ConflictResponse,
  })
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(@Body() loginUserDto: LoginUserDto) {
    return this.appService.signIn(loginUserDto);
  }

  @ApiNoContentResponse({
    description: '`No Content`',
  })
  @ApiUnauthorizedResponse({
    description: '`Unauthorized`',
    type: UnauthorizedResponse,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(SessionsGuard)
  @Post('sign-out')
  async signOut(@Req() req: Request) {
    return this.appService.signOut(req);
  }
}
