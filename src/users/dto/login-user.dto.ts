import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ example: 'valid@email.dev' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '12345678' })
  @IsString()
  @MinLength(8)
  password: string;
}
