import { LoginUserDto } from './login-user.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto extends LoginUserDto {
  @ApiProperty({ required: false, example: 'username' })
  @IsOptional()
  @IsString()
  name?: string;
}
