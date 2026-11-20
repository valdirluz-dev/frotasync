import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth/session";
import { isPublicRoute } from "@/lib/auth/publicRoutes";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const session = request.cookies.get(SESSION_COOKIE_NAME);

  if (!(await verifySessionToken(session?.value))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Configuração para vigiar todas as rotas (exceto imagens e arquivos do Next.js)
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};