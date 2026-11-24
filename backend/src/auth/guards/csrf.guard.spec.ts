import { ConfigService } from '@nestjs/config';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { CsrfGuard } from './csrf.guard';

describe('CsrfGuard', () => {
  let guard: CsrfGuard;

  const trustedOrigins =
    'http://localhost:3000,http://127.0.0.1:3000';

  const createContext = (
    method: string,
    headers: Record<string, string> = {},
  ): ExecutionContext => {
    const request = { method, headers } as unknown as Request;

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;
  };

  beforeEach(() => {
    const configService = new ConfigService({
      CSRF_TRUSTED_ORIGINS: trustedOrigins,
    });

    guard = new CsrfGuard(configService);
  });

  it('deve permitir uma origem confiável com o cabeçalho CSRF', () => {
    const context = createContext('POST', {
      'x-frotasync-client': 'web',
      origin: 'http://localhost:3000',
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('deve bloquear requisições sem o cabeçalho CSRF', () => {
    const context = createContext('POST', {
      origin: 'http://localhost:3000',
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('deve bloquear requisições sem Origin', () => {
    const context = createContext('POST', {
      'x-frotasync-client': 'web',
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('deve bloquear origens não confiáveis', () => {
    const context = createContext('POST', {
      'x-frotasync-client': 'web',
      origin: 'https://site-malicioso.example',
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it.each(['POST', 'PUT', 'PATCH', 'DELETE'])(
    'deve exigir proteção para %s',
    (method) => {
      const context = createContext(method, {
        'x-frotasync-client': 'web',
        origin: 'http://127.0.0.1:3000',
      });

      expect(guard.canActivate(context)).toBe(true);
    },
  );

  it('não deve exigir cabeçalhos em requisições GET', () => {
    const context = createContext('GET');

    expect(guard.canActivate(context)).toBe(true);
  });
});
