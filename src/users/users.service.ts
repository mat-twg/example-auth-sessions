import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { PASSWORD_PEPPER } from './constants';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private readonly config: ConfigService,
    @InjectModel(User.name) private model: Model<UserDocument>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.model.findById(new Types.ObjectId(id));
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.model.findOne({ email: email });
  }

  async validate(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(
      password + this.config.get(PASSWORD_PEPPER),
      user.passwordHash,
    );
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.model.create({
      email: createUserDto.email,
      name: createUserDto.name,
      passwordHash: await bcrypt.hash(
        createUserDto.password + this.config.get(PASSWORD_PEPPER),
        await bcrypt.genSalt(),
      ),
    });
  }
}
