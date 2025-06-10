import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
<<<<<<< HEAD
  message?: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
=======
  data: T;
  message?: string;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
>>>>>>> 2c8043283d04c7cfdd332081d0cb9679f5aeac9a
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
<<<<<<< HEAD
      map((data: unknown) => ({
        success: true,
        message: (data as any)?.message || '',
        data: (data as any)?.data !== undefined ? (data as any).data : data,
      })),
    );
  }
}
=======
      map((data) => {
        // Si la respuesta ya tiene el formato correcto, la devolvemos tal como está
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Si no, la envolvemos en nuestro formato estándar
        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
>>>>>>> 2c8043283d04c7cfdd332081d0cb9679f5aeac9a
