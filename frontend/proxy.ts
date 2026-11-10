import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. A ÚNICA PÁGINA PÚBLICA DO SISTEMA INTEIRO É O LOGIN:
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // 2. PROTEÇÃO DO CADASTRO:
  // Se tentar acessar qualquer tela de cadastro (/cadastro/Dados-Pessoais, etc.):
  if (pathname.startsWith("/cadastro")) {
    const podeCadastrar = request.cookies.get("pode_cadastrar");

    // Se NÃO veio pelo clique do botão no Login, expulsa para o Login:
    if (!podeCadastrar?.value) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Se tem a permissão temporária, deixa passar:
    return NextResponse.next();
  }

  // 3. TODAS AS OUTRAS TELAS SÃO PRIVADAS (Dashboard, Unidades, Tarefas, etc.):
  const session = request.cookies.get("frotasync_session");

  // Se não tem login ativo, tranca a porta e manda para o Login:
  if (!session?.value) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Se tem sessão válida, autoriza o acesso:
  return NextResponse.next();
}

// Configuração para vigiar todas as rotas (exceto imagens e arquivos do Next.js)
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};