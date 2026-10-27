import { IDdadosPessoais } from "./dadosPessoais";
import { IDadosEmpresa } from "./dadosEmpresa";
import { IDadosLogin } from "./dadosLogin";

export interface ICadastroCompleto {
  pessoais: IDdadosPessoais;
  empresa: IDadosEmpresa;
  login: IDadosLogin;
}

export async function mockFinalizarCadastroECorrigir(payload: ICadastroCompleto) {
  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    success: true,
    message: "Cadastro concluído com sucesso! Redirecionando para o login...",
    redirectTo: "/login",
  };
}