export interface IDadosLogin {
  email: string;
  senha: string;
  confirmarSenha?: string;
}

export async function mockValidarDadosLogin(dados: IDadosLogin) {
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (!dados.email || !dados.senha) {
    return { success: false, message: "Preencha o e-mail e a senha." };
  }

  if (dados.email === "admin@frotasync.com") {
    return { success: false, message: "Este e-mail já está cadastrado no sistema." };
  }

  return { success: true, message: "Credenciais de acesso disponíveis!" };
}