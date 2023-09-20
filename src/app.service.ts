import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users/users.service';
import { CreateUserDto } from './users/dto/create-user.dto';
import { LoginUserDto } from './users/dto/login-user.dto';
import { User } from './users/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import { SessionsService } from './sessions/sessions.service';
import { Request } from 'express';
import { Logger } from './components/logger';

@Injectable()
export class AppService {
  private logger: Logger = new Logger(this.constructor.name);

  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto).then((user) => {
      this.logger.log(`User [${user.id}] signed up.`, 'SignUp');
      return user;
    });
  }

  async signIn(loginUserDto: LoginUserDto): Promise<User> {
    const user = await this.usersService.findByEmail(loginUserDto.email);

    if (!(await this.usersService.validate(user, loginUserDto.password))) {
      throw new UnauthorizedException();
    }

    const id = await this.sessionsService.create(user.id);
    if (!id) {
      throw new ConflictException();
    }
    this.logger.log(`User [${user.id}] with session [${id}]`, 'SignIn');

    return user;
  }

  async signOut(req: Request): Promise<void> {
    return this.sessionsService
      .delete(req.sessionID, req.session['userId'])
      .finally(() =>
        this.logger.log(
          `User [${req.session['userId']}] with session [${req.sessionID}]`,
          'SignOut',
        ),
      );
  }
}
