import { redefinirSenhaSchema } from "@/schemas/acesso";
import { redefinirSenhaComToken } from "@/lib/auth/passwordRecovery";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "Solicitação inválida." }, { status: 400 });
  }

  const result = redefinirSenhaSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { message: "Confira a senha e a confirmação preenchidas." },
      { status: 400 },
    );
  }

  const updated = await redefinirSenhaComToken(
    result.data.token,
    result.data.senha,
  );
  if (!updated) {
    return Response.json(
      { message: "Sua sessão expirou. Solicite um novo código." },
      { status: 400 },
    );
  }

  return Response.json({ success: true });
}
