import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface CampoInvalido {
  campo: string;
  mensagem: string;
}

interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  codigo?: string;
  message: string;
  path: string;
  erros: CampoInvalido[];
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const responseBody: Record<string, unknown> =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as Record<string, unknown>)
        : {};

    const isInternalError = status >= 500;

    const message = isInternalError
      ? 'Erro interno do servidor'
      : status === HttpStatus.BAD_REQUEST
        ? 'Um ou mais campos são inválidos'
        : typeof responseBody.message === 'string'
          ? responseBody.message
          : exception instanceof HttpException
            ? exception.message
            : 'Erro inesperado';

    const codigo =
      typeof responseBody.codigo === 'string' ? responseBody.codigo : undefined;

    const erros: CampoInvalido[] = Array.isArray(responseBody.errors)
      ? responseBody.errors.map((item: any) => ({
          campo: item.field ?? item.campo ?? '',
          mensagem: item.message ?? item.mensagem ?? '',
        }))
      : Array.isArray(responseBody.erros)
        ? responseBody.erros.map((item: any) => ({
            campo: item.campo ?? '',
            mensagem: item.mensagem ?? '',
          }))
        : [];

    const error = HttpStatus[status] ?? 'INTERNAL_SERVER_ERROR';

    const errorResponse: ApiErrorResponse = {
      timestamp: new Date().toISOString(),
      status,
      error,
      ...(codigo && { codigo }),
      message,
      path: request.url,
      erros: erros,
    };

    response.status(status).json(errorResponse);
  }
}
