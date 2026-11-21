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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeValidationError(value: unknown): CampoInvalido | null {
  if (!isRecord(value)) {
    return null;
  }

  const campo = value.field ?? value.campo;
  const mensagem = value.message ?? value.mensagem;

  if (typeof campo !== 'string' || typeof mensagem !== 'string') {
    return null;
  }

  return { campo, mensagem };
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

    const responseBody = isRecord(exceptionResponse) ? exceptionResponse : {};

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

    const rawErrors = Array.isArray(responseBody.errors)
      ? responseBody.errors
      : Array.isArray(responseBody.erros)
        ? responseBody.erros
        : [];

    const erros = rawErrors
      .map(normalizeValidationError)
      .filter((item): item is CampoInvalido => item !== null);

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
