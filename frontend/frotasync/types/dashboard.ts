export type UnidadeStatus = "Ativa" | "Inativa";
export type DocumentoStatus = "Válido" | "Próximo do vencimento" | "Expirado";
export type TarefaStatus = "Pendente" | "Em andamento" | "Concluída";

export type Unidade = {
  id: string;
  nome: string;
  codigo: string;
  status: UnidadeStatus;
  endereco: EnderecoUnidade;
};

export type EnderecoUnidade = {
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
};

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
