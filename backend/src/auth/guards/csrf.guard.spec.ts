import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { describe, expect, it } from '@jest/globals';
import { CsrfGuard } from './csrf.guard';

function context(method: string, header?: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        method,
        headers: header ? { 'x-frotasync-client': header } : {},
      }),
    }),
  } as ExecutionContext;
}

describe('CsrfGuard', () => {
  const guard = new CsrfGuard();

  it('aceita operações de escrita com o cabeçalho web', () => {
    expect(guard.canActivate(context('POST', 'web'))).toBe(true);
  });

  it('rejeita operações de escrita sem o cabeçalho web', () => {
    expect(() => guard.canActivate(context('DELETE'))).toThrow(
      ForbiddenException,
    );
  });

  it('não exige o cabeçalho em consultas', () => {
    expect(guard.canActivate(context('GET'))).toBe(true);
  });
});
