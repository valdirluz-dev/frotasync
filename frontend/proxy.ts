import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Login and its API endpoint must be reachable without a session.
  if (pathname === "/login" || pathname === "/api/auth/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/cadastro")) {
    const podeCadastrar = request.cookies.get("pode_cadastrar");

    if (!podeCadastrar?.value) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
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