export type DadosPessoaisSeed = {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  cargo: string;
  criadoEm: string;
};

// Utilitário para calcular datas relativas com base no dia atual
function dateOffset(days: number): string {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// Lista inicial de pessoa estruturada como objeto 
const pessoasIniciais: DadosPessoaisSeed[] = [
  {
    id: "perfil-001",
    nome: "Maria Luiza da Silva",
    cpf: "123.456.789-00",
    telefone: "+55 (81) 98765-4321",
    cargo: "Administradora de Frotas",
    criadoEm: dateOffset(0),
  },
 
  
];

// Chave para salvar no localStorage
const CHAVE_LOCAL_STORAGE = "@MinhaApp:dadosPessoais";

// Retorna os dados salvos ou inicializa com a lista padrão (com verificação SSR para Next.js)
export function obterDadosPessoaisSalvos(): DadosPessoaisSeed[] {
  if (typeof window === "undefined") {
    return pessoasIniciais;
  }

  const dadosNaJanela = localStorage.getItem(CHAVE_LOCAL_STORAGE);
  
  if (dadosNaJanela) {
    return JSON.parse(dadosNaJanela);
  }
  
  localStorage.setItem(CHAVE_LOCAL_STORAGE, JSON.stringify(pessoasIniciais));
  return pessoasIniciais;
}

// Simula o salvamento atualizando a lista no localStorage
export async function simularEnvioDadosPessoais(novosDados: any) {
  const listaAtual = obterDadosPessoaisSalvos();
  
  const index = listaAtual.findIndex((p) => p.id === novosDados.id);

  if (index >= 0) {
    listaAtual[index] = novosDados;
  } else {
    listaAtual.push(novosDados);
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(CHAVE_LOCAL_STORAGE, JSON.stringify(listaAtual));
  }

  return {
    success: true,
    message: "Dados pessoais guardados com sucesso!",
    data: listaAtual,
  };
}