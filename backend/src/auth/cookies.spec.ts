import { describe, expect, it, jest } from '@jest/globals';
import { Response } from 'express';
import {
  clearAuthCookies,
  getCookieHeader,
  setAuthCookies,
} from './cookies';

describe('cookies de autenticação', () => {
  it('emite os três cookies com atributos seguros', () => {
    const cookie = jest.fn();
    setAuthCookies(
      { cookie } as unknown as Response,
      {
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        remember: false,
      },
    );

    expect(cookie).toHaveBeenCalledTimes(3);
    expect(cookie).toHaveBeenCalledWith(
      'frotasync_access',
      'access',
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/api/v1',
      }),
    );
    expect(cookie).toHaveBeenCalledWith(
      'frotasync_refresh',
      'refresh',
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/api/v1/auth',
      }),
    );
  });

  it('limpa os três cookies', () => {
    const cookie = jest.fn();
    clearAuthCookies({ cookie } as unknown as Response);
    expect(cookie).toHaveBeenCalledTimes(3);
  });

  it('extrai o refresh cookie manualmente', () => {
    expect(
      getCookieHeader(
        { headers: { cookie: 'outro=1; frotasync_refresh=abc%20123' } },
        'frotasync_refresh',
      ),
    ).toBe('abc 123');
  });
});
