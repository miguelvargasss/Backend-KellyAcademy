import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * http-exception.filter.ts — Filtro global de excepciones HTTP
 * ──────────────────────────────────────────────────────────────
 * SRP: intercepta todas las excepciones y devuelve una respuesta
 * JSON consistente con la estructura ApiResponseDto.
 *
 * Registrado como APP_FILTER global en AppModule.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? ((exception.getResponse() as { message?: string | string[] })
            ?.message ?? exception.message)
        : 'Internal server error';

    const errorPayload = {
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (status >= 400) {
      this.logger.error(
        `[${request.method}] ${request.url} — ${status} - ${JSON.stringify(message)}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json(errorPayload);
  }
}
