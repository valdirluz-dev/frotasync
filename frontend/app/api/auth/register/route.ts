import { registrarUsuario } from "@/lib/auth/registration";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { message: "Solicitação de cadastro inválida." },
      { status: 400 },
    );
  }

  const result = await registrarUsuario(body);
  if (!result.success) {
    return Response.json({ message: result.message }, { status: result.status });
  }

  return Response.json({ success: true }, { status: 201 });
}
