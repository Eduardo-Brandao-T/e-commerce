import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class ExcludePasswordInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const removePassword = (item: any): any => {
          if (!item || typeof item !== 'object') return item;

          if (Array.isArray(item)) {
            return item.map(removePassword);
          }

          const { password, ...rest } = item;
          return Object.entries(rest).reduce((acc, [key, value]) => {
            acc[key] = removePassword(value);
            return acc;
          }, {} as any);
        };

        return removePassword(data);
      }),
    );
  }
}
