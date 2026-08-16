import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

type PostgresDriverError = Error & {
  code?: string;
  detail?: string;
  schema?: string;
  table?: string;
  column?: string;
  constraint?: string;
};

/**
 * Retain actionable database diagnostics in server logs while keeping the
 * public HTTP response free of schema and SQL details.
 */
@Catch(QueryFailedError)
export class QueryFailedErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(QueryFailedErrorFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const driverError = exception.driverError as PostgresDriverError;

    this.logger.error(
      JSON.stringify({
        method: request.method,
        endpoint: request.originalUrl || request.url,
        exception: exception.name,
        message: exception.message,
        postgresCode: driverError.code,
        detail: driverError.detail,
        schema: driverError.schema,
        table: driverError.table,
        column: driverError.column,
        constraint: driverError.constraint,
        query: exception.query,
      }),
      exception.stack,
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}
