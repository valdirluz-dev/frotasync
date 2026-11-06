export interface IDadosLogin {
  email: string;
  senha: string;
  confirmarSenha?: string;
  criadoEm?: string;
}

// Utilitário para calcular datas relativas com base no dia atual
function dateOffset(days: number): string {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// Lista inicial padrão de login para teste.
const loginsIniciais: IDadosLogin[] = [
  {
    email: "marialuiza@logisticaexpress.com.br",
    senha: "#02Senha2000",
    confirmarSenha: "#02Senha2000",
    criadoEm: dateOffset(0),
  },
 
];

// Chave única para salvar no localStorage do navegador
const CHAVE_LOCAL_STORAGE = "@MinhaApp:dadosDeLogin";

// Retorna os dados salvos ou inicializa com os logins corporativos padrão
export function obterDadosLoginSalvos(): IDadosLogin[] {
  if (typeof window === "undefined") {
    return loginsIniciais;
  }

  const dadosNaJanela = localStorage.getItem(CHAVE_LOCAL_STORAGE);
  
  if (dadosNaJanela) {
    return JSON.parse(dadosNaJanela);
  }
  
  localStorage.setItem(CHAVE_LOCAL_STORAGE, JSON.stringify(loginsIniciais));
  return loginsIniciais;
}

// Simula a validação e o salvamento atualizando o localStorage
export async function mockValidarDadosLogin(novosDados: IDadosLogin) {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const listaAtual = obterDadosLoginSalvos();

  const index = listaAtual.findIndex((l) => l.email === novosDados.email);

  if (index >= 0) {
    listaAtual[index] = novosDados;
  } else {
    listaAtual.push(novosDados);
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(CHAVE_LOCAL_STORAGE, JSON.stringify(listaAtual));
  }

  if (!novosDados.email || !novosDados.senha) {
    return {
      success: false,
      message: "Por favor, preencha o e-mail corporativo e a senha.",
    };
  }

  if (novosDados.confirmarSenha && novosDados.senha !== novosDados.confirmarSenha) {
    return {
      success: false,
      message: "As senhas não coincidem.",
    };
  }

  return {
    success: true,
    message: "Dados de login corporativo validados e guardados com sucesso!",
    data: listaAtual,
  };
}