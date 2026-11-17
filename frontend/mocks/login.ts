// frontend/mocks/login.ts
<<<<<<< HEAD
=======
import { loginSchema } from "@/schemas/acesso";

>>>>>>> f13a41d9f08de0ef78f282cfb715fd7112a3d412
import { tabelaUsuarios, setUsuarioLogado } from "./authStore";

export interface IDadosLoginTela {
  email: string;
  senha: string;
  lembreMe?: boolean;
}

export async function mockFazerLogin(dados: IDadosLoginTela) {
  // Simula latência de rede realista
  await new Promise((resolve) => setTimeout(resolve, 500));

<<<<<<< HEAD
  if (!dados.email || !dados.senha) {
=======
  if (!loginSchema.safeParse(dados).success) {
>>>>>>> f13a41d9f08de0ef78f282cfb715fd7112a3d412
    return {
      success: false,
      message: "Por favor, preencha o e-mail corporativo e a senha.",
    };
  }

  // Busca na lista em memória sem precisar de localStorage
  const utilizadorValido = tabelaUsuarios.find(
    (item) =>
      item.email.trim().toLowerCase() === dados.email.trim().toLowerCase() &&
      item.senhaHash === dados.senha
  );

  if (!utilizadorValido) {
    return {
      success: false,
      message: "E-mail ou senha incorretos. Verifique os dados digitados.",
    };
  }

  // Define como o usuário ativo da sessão
  setUsuarioLogado(utilizadorValido);

  return {
    success: true,
    message: "Login realizado com sucesso! Redirecionando...",
    redirectTo: "/dashboard",
    usuario: {
      id: utilizadorValido.id,
      nome: utilizadorValido.nome,
      email: utilizadorValido.email,
      cargo: utilizadorValido.cargo,
      token: "fake-jwt-token-frotasync",
    },
  };
}