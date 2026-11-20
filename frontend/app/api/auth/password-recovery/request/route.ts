import { z } from "zod";

import { solicitarCodigoRecuperacao } from "@/lib/auth/passwordRecovery";

const requestSchema = z.object({
  email: z.string().trim().email(),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Solicitação inválida." }, { status: 400 });
  }

  const result = requestSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { message: "Digite um e-mail válido." },
      { status: 400 },
    );
  }

  const response = await solicitarCodigoRecuperacao(result.data.email);
  if (!response.success) {
    return Response.json(
      { message: "Aguarde um minuto antes de solicitar outro código." },
      { status: response.status },
    );
  }

  return Response.json({
    success: true,
    message:
      "Se houver uma conta para este e-mail, enviaremos um código de verificação.",
  });
}
