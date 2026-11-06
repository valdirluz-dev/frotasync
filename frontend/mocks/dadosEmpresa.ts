export type DadosEmpresaSeed = {
  id: string;
  nomeEmpresa: string;
  razaoSocial: string;
  cnpj: string;
  segmento: string;
  tipoUnidade: string;
  cep: string;
  estado: string;
  cidade: string;
  bairro: string;
  logradouro: string;
  numero: string;
  criadoEm: string;
};

// Utilitário para calcular datas relativas com base no dia atual
function dateOffset(days: number): string {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// Lista inicial de empresa estruturada diretamente como objeto
const empresasIniciais: DadosEmpresaSeed[] = [
  {
    id: "emp-001",
    nomeEmpresa: "Logística Express Ltda",
    razaoSocial: "Logística Express Transportes e Serviços S.A.",
    cnpj: "11.222.333/0001-81",
    segmento: "Transporte e Distribuição",
    tipoUnidade: "Matriz",
    cep: "50000-000",
    estado: "PE",
    cidade: "Recife",
    bairro: "Santo Amaro",
    logradouro: "Rua Exemplo",
    numero: "100",
    criadoEm: dateOffset(0),
  },
 
];

// Chave única para salvar no localStorage do navegador
const CHAVE_LOCAL_STORAGE = "@MinhaApp:empresa";

// Retorna o que está salvo no navegador ou inicializa com a lista padrão
export function obterDadosEmpresaSalvos(): DadosEmpresaSeed[] {
  // Verifica se estamos no ambiente do navegador para evitar erros de SSR (Server-Side Rendering)
  if (typeof window === "undefined") {
    return empresasIniciais;
  }

  const dadosNaJanela = localStorage.getItem(CHAVE_LOCAL_STORAGE);
  
  if (dadosNaJanela) {
    return JSON.parse(dadosNaJanela);
  }
  
  // Se for a primeira vez, grava as iniciais no localStorage
  localStorage.setItem(CHAVE_LOCAL_STORAGE, JSON.stringify(empresasIniciais));
  return empresasIniciais;
}

// Simula o salvamento atualizando o localStorage
export async function mockValidarDadosEmpresa(novosDados: any) {
  const listaAtual = obterDadosEmpresaSalvos();
  
  const index = listaAtual.findIndex((p) => p.id === novosDados.id);

  if (index >= 0) {
    listaAtual[index] = novosDados;
  } else {
    listaAtual.push(novosDados);
  }

  // Grava a lista atualizada de volta no navegador
  if (typeof window !== "undefined") {
    localStorage.setItem(CHAVE_LOCAL_STORAGE, JSON.stringify(listaAtual));
  }

  return {
    success: true,
    message: "Dados da empresa guardados com sucesso!",
    data: listaAtual,
  };
}