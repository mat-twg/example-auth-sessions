import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { SessionsModule } from './sessions/sessions.module';
import * as process from 'process';

const env = process.env;

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      env.MONGO_URI ||
        `mongodb://${env.MONGO_HOST}:${env.MONGO_PORT}/${env.MONGO_DB}`,
    ),
    SessionsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
