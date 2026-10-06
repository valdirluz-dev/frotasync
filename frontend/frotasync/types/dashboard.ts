export type UnidadeStatus = "Ativa" | "Inativa";
export type DocumentoStatus = "Válido" | "Próximo do vencimento" | "Expirado";
export type TarefaStatus = "Pendente" | "Em andamento" | "Concluída";

export type Unidade = {
  id: string;
  nome: string;
  codigo: string;
  status: UnidadeStatus;
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
