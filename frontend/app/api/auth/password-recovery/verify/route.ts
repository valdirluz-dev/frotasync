import { z } from "zod";

import { verificarCodigoRecuperacao } from "@/lib/auth/passwordRecovery";

const verifySchema = z.object({
  email: z.string().trim().email(),
  code: z.string().regex(/^\d{5}$/, "Informe o código de 5 dígitos."),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Solicitação inválida." }, { status: 400 });
  }

  const result = verifySchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { message: "Digite o código de 5 dígitos enviado ao seu e-mail." },
      { status: 400 },
    );
  }

  const verification = verificarCodigoRecuperacao(
    result.data.email,
    result.data.code,
  );
  if (!verification.success) {
    return Response.json(
      { message: "Código inválido ou expirado. Solicite um novo código." },
      { status: 400 },
    );
  }

  return Response.json({ success: true, token: verification.token });
}
