export type UnidadeStatus = "Ativa" | "Inativa";
export type DocumentoStatus = "Válido" | "Próximo do vencimento" | "Expirado";
export type TarefaStatus = "Pendente" | "Em andamento" | "Concluída";

export const UF_SIGLAS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;

export type Uf = (typeof UF_SIGLAS)[number];

export type Unidade = {
  id: string;
  nome: string;
  codigo: string;
  status: UnidadeStatus;
  endereco: EnderecoUnidade;
  descricao?: string;
  criadoEm?: string;
  atualizadoEm?: string;
};

export type EnderecoUnidade = {
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: Uf;
  cep?: string;
  complemento?: string;
};

export type EnderecoCep = Pick<
  EnderecoUnidade,
  "logradouro" | "bairro" | "cidade" | "uf"
>;

export type UnidadeListItem = Unidade & {
  totalDocumentos: number;
  totalTarefas: number;
};

export type UnidadesFilters = {
  page?: number;
  size?: number;
  q?: string;
  status?: UnidadeStatus | "Todos";
};

export type Documento = {
  id: string;
  nome: string;
  unidadeId: string;
  categoria: string;
  dataEmissao: string | null;
  dataValidade: string;
};

export type Tarefa = {
  id: string;
  titulo: string;
  unidadeId: string;
  dataInicio: string;
  prazoFinal: string;
  status: TarefaStatus;
  dataConclusao: string | null;
};

export type DashboardDistribution = {
  label: string;
  value: number;
  color: string;
};

export type DashboardIndicators = {
  unidades: DashboardDistribution[];
  documentos: DashboardDistribution[];
  tarefas: DashboardDistribution[];
  totalPendencias: number;
  documentosAVencer: number;
  tarefasConcluidas: number;
  variacaoDocumentosAVencer: number | null;
  variacaoTarefasConcluidas: number | null;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type DocumentFilters = {
  page: number;
  pageSize: number;
  search: string;
  unidadeId: string;
  categoria: string;
  status: DocumentoStatus | "Todos";
};

export type TaskFilters = {
  page: number;
  pageSize: number;
  search: string;
  unidadeId: string;
  status: TarefaStatus | "Todos";
};
