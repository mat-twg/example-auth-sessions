import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

export class HttpResponse {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: any;
}

export class ForbiddenResponse extends HttpResponse {
  @ApiPropertyOptional({ example: HttpStatus.FORBIDDEN })
  statusCode: number;

  @ApiPropertyOptional({
    type: String,
    example: 'Forbidden',
  })
  message: string;
}

export class NotFoundResponse extends HttpResponse {
  @ApiPropertyOptional({ example: HttpStatus.NOT_FOUND })
  statusCode: number;

  @ApiPropertyOptional({
    type: String,
    example: 'Not Found',
  })
  message: string;
}

export class HttpErrorResponse extends HttpResponse {
  @ApiPropertyOptional()
  error: string;
}

export class BadRequestResponse extends HttpErrorResponse {
  @ApiPropertyOptional({ example: HttpStatus.BAD_REQUEST })
  statusCode: number;

  @ApiPropertyOptional({
    type: String,
    example: ['error message'],
    isArray: true,
  })
  message: string[];

  @ApiPropertyOptional({ example: 'Bad Request' })
  error: string;
}

export class UnauthorizedResponse extends HttpResponse {
  @ApiPropertyOptional({ example: HttpStatus.UNAUTHORIZED })
  statusCode: number;

  @ApiPropertyOptional({ type: String, example: 'Unauthorized' })
  message: string;
}

export class ConflictResponse extends HttpResponse {
  @ApiPropertyOptional({ example: HttpStatus.CONFLICT })
  statusCode: number;

  @ApiPropertyOptional({ type: String, example: 'Conflict' })
  message: string;
}

export class UnprocessableEntityResponse extends HttpResponse {
  @ApiPropertyOptional({ example: HttpStatus.UNPROCESSABLE_ENTITY })
  statusCode: number;

  @ApiPropertyOptional({ type: String, example: 'error message' })
  message: string;

  @ApiPropertyOptional({ example: 'Unprocessable Entity' })
  error: string;
}
