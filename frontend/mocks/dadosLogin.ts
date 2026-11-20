
import { loginSchema } from "@/schemas/acesso";
import { rascunhoCadastro } from "./authStore";

export interface IDadosLogin {
  email: string;
  senha: string;
  confirmarSenha?: string;
  aceiteTermos?: boolean;
  website?: string;
}

export async function mockValidarDadosLogin(novosDados: IDadosLogin) {
  await new Promise((r) => setTimeout(r, 400));

  if (!loginSchema.safeParse(novosDados).success) {
    return { success: false, message: "Preencha o e-mail corporativo e a senha." };
  }

  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...rascunhoCadastro, ...novosDados }),
  });
  const result = (await response.json()) as { message?: string };

  return response.ok
    ? { success: true, message: "Cadastro finalizado com sucesso!" }
    : {
        success: false,
        message: result.message ?? "Não foi possível concluir o cadastro.",
      };
}