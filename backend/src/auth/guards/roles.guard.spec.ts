import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockContext = (user?: any): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as Reflector;

    guard = new RolesGuard(reflector);
  });

  it('should allow access when no roles are defined', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    expect(guard.canActivate(mockContext())).toBe(true);
  });

  it('should allow access when user has an authorized role', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['administrador']);

    const context = mockContext({
      id: 'user-1',
      papel: 'administrador',
    });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException when user has unauthorized role', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['administrador']);

    const context = mockContext({
      id: 'user-2',
      papel: 'colaborador',
    });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException when user is not authenticated', () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['administrador']);

    const context = mockContext(undefined);

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
