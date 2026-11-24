import { Response } from 'express';

export const ACCESS_COOKIE_NAME = 'frotasync_access';
export const REFRESH_COOKIE_NAME = 'frotasync_refresh';
export const SESSION_COOKIE_NAME = 'frotasync_session';

export interface AuthCookies {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  remember: boolean;
}

export function setAuthCookies(
  response: Response,
  cookies: AuthCookies,
): void {
  const refreshMaxAge =
    cookies.remember
      ? 30 * 24 * 60 * 60 * 1000
      : 7 * 24 * 60 * 60 * 1000;

  response.cookie(ACCESS_COOKIE_NAME, cookies.accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/api/v1',
    maxAge: 15 * 60 * 1000,
  });
  response.cookie(REFRESH_COOKIE_NAME, cookies.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/api/v1/auth',
    maxAge: refreshMaxAge,
  });
  response.cookie(SESSION_COOKIE_NAME, String(Math.floor(cookies.expiresAt.getTime() / 1000)), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: refreshMaxAge,
  });
}

export function clearAuthCookies(response: Response): void {
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
  };

  response.cookie(ACCESS_COOKIE_NAME, '', {
    ...options,
    path: '/api/v1',
    maxAge: 0,
  });
  response.cookie(REFRESH_COOKIE_NAME, '', {
    ...options,
    path: '/api/v1/auth',
    maxAge: 0,
  });
  response.cookie(SESSION_COOKIE_NAME, '', {
    ...options,
    path: '/',
    maxAge: 0,
  });
}

export function getCookieHeader(request: { headers?: { cookie?: string } }, name: string): string | null {
  const cookieHeader = request.headers?.cookie;
  if (!cookieHeader) {
    return null;
  }

  for (const part of cookieHeader.split(';')) {
    const [key, ...valueParts] = part.trim().split('=');
    if (key === name) {
      return decodeURIComponent(valueParts.join('='));
    }
  }

  return null;
}
