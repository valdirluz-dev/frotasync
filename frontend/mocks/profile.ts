// Chaves do localStorage usadas nos respetivos formulários e mocks
const CHAVE_PESSOAIS = "@MinhaApp:dadosPessoais";
const CHAVE_EMPRESA = "@MinhaApp:empresa";
const CHAVE_LOGIN = "@MinhaApp:dadosDeLogin";

/**
 * Interface unificada para o Perfil consolidado da aplicação.
 */
export type ProfileData = {
  // Dados Pessoais
  nome: string;
  cpf: string;
  telefone: string;
  cargo: string;

  // Dados de Login
  email: string;

  // Dados da Empresa e Unidade
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
};

/**
 * Mock padrão de segurança / fallback caso o localStorage esteja vazio
 */
export const profileMock: ProfileData = {
  nome: "Maria Luiza da Silva",
  cpf: "123.456.789-00",
  telefone: "+55 (81) 98765-4321",
  cargo: "Administradora de Frotas",
  email: "marialuiza@logisticaexpress.com.br",
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
};

/**
 * Função utilitária que unifica os dados guardados no localStorage de cada passo
 * com fallback para o profileMock se necessário.
 */
export function obterPerfilConsolidado(): ProfileData {
  // Proteção para SSR (Server-Side Rendering do Next.js)
  if (typeof window === "undefined") {
    return profileMock;
  }

  try {
    // 1. Recupera dados pessoais do localStorage
    const dadosPessoaisRaw = localStorage.getItem(CHAVE_PESSOAIS);
    const pessoal = dadosPessoaisRaw ? JSON.parse(dadosPessoaisRaw)[0] : null;

    // 2. Recupera dados da empresa do localStorage
    const dadosEmpresaRaw = localStorage.getItem(CHAVE_EMPRESA);
    const empresa = dadosEmpresaRaw ? JSON.parse(dadosEmpresaRaw)[0] : null;

    // 3. Recupera dados de login do localStorage
    const dadosLoginRaw = localStorage.getItem(CHAVE_LOGIN);
    const login = dadosLoginRaw ? JSON.parse(dadosLoginRaw)[0] : null;

    // Retorna o objeto unificado cruzando os dados reais salvos com o mock padrão
    return {
      nome: pessoal?.nome || profileMock.nome,
      cpf: pessoal?.cpf || profileMock.cpf,
      telefone: pessoal?.telefone || profileMock.telefone,
      cargo: pessoal?.cargo || profileMock.cargo,

      email: login?.email || profileMock.email,

      nomeEmpresa: empresa?.nomeEmpresa || profileMock.nomeEmpresa,
      razaoSocial: empresa?.razaoSocial || profileMock.razaoSocial,
      cnpj: empresa?.cnpj || profileMock.cnpj,
      segmento: empresa?.segmento || profileMock.segmento,
      tipoUnidade: empresa?.tipoUnidade || profileMock.tipoUnidade,
      cep: empresa?.cep || profileMock.cep,
      estado: empresa?.estado || profileMock.estado,
      cidade: empresa?.cidade || profileMock.cidade,
      bairro: empresa?.bairro || profileMock.bairro,
      logradouro: empresa?.logradouro || profileMock.logradouro,
      numero: empresa?.numero || profileMock.numero,
    };
  } catch (error) {
    console.error("Erro ao carregar dados do perfil do localStorage:", error);
    return profileMock;
  }
}