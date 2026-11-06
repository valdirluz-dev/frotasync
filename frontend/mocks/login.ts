// Importa a função utilitária do mock de cadastro para recuperar os logins guardados no localStorage
import { obterDadosLoginSalvos } from "./dadosLogin";

// Interface que define os tipos de dados aceites pelo formulário de Login
export interface IDadosLoginTela {
  email: string;
  senha: string;
  lembreMe?: boolean;
}

// Usuário padrão fixo para garantir que a apresentação de amanhã funcione sem depender de cadastro prévio
const USUARIO_PADRAO_TESTE = {
  email: "marialuiza@logisticaexpress.com.br",
  senha: "#02Senha2000",
};

/**
 * Função mock que simula a autenticação do utilizador na tela de Login.
 * Valida o e-mail e a senha informados cruzando com o cadastro salvo ou com o usuário padrão de teste.
 */
export async function mockFazerLogin(dados: IDadosLoginTela) {
  // Simula o tempo de resposta de uma requisição de rede (600ms)
  await new Promise((resolve) => setTimeout(resolve, 600));

  // Validação básica: verifica se os campos obrigatórios foram preenchidos
  if (!dados.email || !dados.senha) {
    return {
      success: false,
      message: "Por favor, preencha o e-mail e a senha.",
    };
  }

  // Busca a lista de cadastros salvos no localStorage (se houver algum no navegador)
  const cadastrosSalvos = obterDadosLoginSalvos();

  // Combina o usuário padrão fixo de teste com qualquer cadastro feito via formulário
  const listaUsuariosValidos = [USUARIO_PADRAO_TESTE, ...cadastrosSalvos];

  // Procura na lista por algum registo que coincida exatamente com o e-mail e a senha digitados
  const utilizadorValido = listaUsuariosValidos.find(
    (item) =>
      item.email.trim().toLowerCase() === dados.email.trim().toLowerCase() &&
      item.senha === dados.senha
  );

  // Se não encontrar nenhuma correspondência válida, retorna erro de credenciais
  if (!utilizadorValido) {
    return {
      success: false,
      message: "E-mail ou senha incorretos. Verifique os dados digitados.",
    };
  }

  // Gerencia o "Lembre-me": se marcado, guarda o e-mail no localStorage do navegador
  if (typeof window !== "undefined") {
    if (dados.lembreMe) {
      localStorage.setItem("@MinhaApp:ultimoEmail", dados.email);
    } else {
      localStorage.removeItem("@MinhaApp:ultimoEmail");
    }
  }

  // Retorno em caso de sucesso: autoriza a entrada e fornece os dados simulados
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