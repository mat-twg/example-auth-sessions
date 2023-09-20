import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnprocessableEntityException,
} from '@nestjs/common';
import { catchError, Observable } from 'rxjs';

@Injectable()
export class DuplicateKeyInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error.code === 11000) {
          throw new UnprocessableEntityException(
            `This ${Object.keys(error.keyPattern)[0]} already exists`,
          );
        }
        throw error;
      }),
    );
  }
}
