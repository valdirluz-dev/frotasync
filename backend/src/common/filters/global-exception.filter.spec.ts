import { jest } from '@jest/globals';

import {
  ArgumentsHost,
  ConflictException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: {
    status: jest.Mock;
    json: jest.Mock;
  };
  let mockRequest: {
    url: string;
  };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockRequest = {
      url: '/api/v1/empresas',
    };

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ArgumentsHost;
  });

  it('should handle 400 validation errors', () => {
    const exception = new HttpException(
      {
        statusCode: 400,
        message: 'Um ou mais campos são inválidos',
        errors: [
          {
            field: 'nome',
            message: 'Nome é obrigatório',
          },
        ],
      },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 400,
        error: 'BAD_REQUEST',
        message: 'Um ou mais campos são inválidos',
        path: '/api/v1/empresas',
        erros: [
          {
            campo: 'nome',
            mensagem: 'Nome é obrigatório',
          },
        ],
      }),
    );
  });

  it('should handle 404 not found errors', () => {
    const exception = new NotFoundException('Empresa não encontrada');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(404);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 404,
        error: 'NOT_FOUND',
        message: 'Empresa não encontrada',
        path: '/api/v1/empresas',
        erros: [],
      }),
    );
  });

  it('should handle 409 conflict errors with business code', () => {
    const exception = new ConflictException({
      message: 'CNPJ já cadastrado',
      codigo: 'CNPJ_DUPLICADO',
    });

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(409);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 409,
        error: 'CONFLICT',
        codigo: 'CNPJ_DUPLICADO',
        message: 'CNPJ já cadastrado',
        path: '/api/v1/empresas',
        erros: [],
      }),
    );
  });

  it('should hide internal details in 500 errors', () => {
    const exception = new Error('Database password leaked');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 500,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Erro interno do servidor',
        path: '/api/v1/empresas',
        erros: [],
      }),
    );
  });
});
