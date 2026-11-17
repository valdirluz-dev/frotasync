import { cookies } from "next/headers";
import { z } from "zod";

import { loginSchema } from "@/schemas/acesso";
import { tabelaUsuarios } from "@/mocks/authStore";
import {
  createSessionToken,
  hasSessionSecret,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";

const loginRequestSchema = loginSchema.extend({
  lembreMe: z.boolean().optional(),
  website: z.string().optional(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { message: "Solicitação de login inválida." },
      { status: 400 },
    );
  }

  const result = loginRequestSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { message: "Preencha o e-mail corporativo e a senha." },
      { status: 400 },
    );
  }

  if (result.data.website?.trim()) {
    return Response.json(
      { message: "E-mail ou senha incorretos." },
      { status: 401 },
    );
  }

  const user = tabelaUsuarios.find(
    (item) =>
      item.email.trim().toLowerCase() ===
        result.data.email.trim().toLowerCase() &&
      item.senhaHash === result.data.senha,
  );

  if (!user) {
    return Response.json(
      { message: "E-mail ou senha incorretos." },
      { status: 401 },
    );
  }

  if (!hasSessionSecret()) {
    return Response.json(
      {
        message:
          "Autenticação indisponível. Configure FROTASYNC_SESSION_SECRET com pelo menos 32 caracteres.",
      },
      { status: 503 },
    );
  }

  const maxAge = result.data.lembreMe ? 30 : 7;
  const maxAgeSeconds = maxAge * 24 * 60 * 60;
  const token = await createSessionToken(user.id, maxAgeSeconds);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });

  return Response.json({ success: true });
}
