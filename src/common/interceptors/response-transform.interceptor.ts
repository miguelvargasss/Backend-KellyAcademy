import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Estructura de respuesta exitosa normalizada.
 * Todos los endpoints devuelven esta forma.
 */
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * response-transform.interceptor.ts — Envuelve todas las respuestas exitosas.
 * ─────────────────────────────────────────────────────────────────────────────
 * SRP: su única responsabilidad es normalizar el formato de respuesta.
 * Registrado globalmente en AppModule.
 */
@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const statusCode = context
      .switchToHttp()
      .getResponse<{ statusCode: number }>().statusCode;

    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode,
        data: (data ?? null) as unknown as T,
      })),
    );
  }
}
