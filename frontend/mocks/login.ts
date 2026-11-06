export interface IDadosLoginTela {
  email: string;
  senha: string;
}

export async function mockFazerLogin(dados: IDadosLoginTela) {
  await new Promise((resolve) => setTimeout(resolve, 600));

  if (!dados.email || !dados.senha) {
    return {
      success: false,
      message: "Por favor, preencha o e-mail e a senha.",
    };
  }

  return {
    success: true,
    message: "Login realizado com sucesso! Redirecionando...",
    redirectTo: "/dashboard",
    usuario: {
      id: "usr_" + Date.now(),
      email: dados.email,
      token: "fake-jwt-token-frotasync",
    },
  };
}