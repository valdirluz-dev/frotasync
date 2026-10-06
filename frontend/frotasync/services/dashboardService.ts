import { calcularStatusDocumento } from "../lib/status";
import { mockDocumentos, mockTarefas, mockUnidades } from "../mocks/dashboard";
import type {
  DashboardIndicators,
  DocumentFilters,
  Documento,
  DocumentoStatus,
  Paginated,
  Tarefa,
  TaskFilters,
  Unidade,
  UnidadeIndicadores,
  UnidadeStatus,
  TarefaStatus,
  PerfilUsuario,
} from "../types/dashboard";
import { mockUsuarioSessao } from "../mocks/sessao";

const wait = (milliseconds = 180) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
const normalize = (value: string) => value.trim().toLocaleLowerCase("pt-BR");

export class UnidadeInativaError extends Error {
  readonly code = "UNIDADE_INATIVA";

  constructor() {
    super("Não é possível modificar registros de uma unidade inativa.");
    this.name = "UnidadeInativaError";
  }
}

export class RecursoNaoEncontradoError extends Error {
  constructor(resource: string) {
    super(`${resource} não encontrado.`);
    this.name = "RecursoNaoEncontradoError";
  }
}

export class PerfilSemPermissaoError extends Error {
  constructor() {
    super("Somente Administrador pode alterar o status da unidade.");
    this.name = "PerfilSemPermissaoError";
  }
}

function monthKey(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function offsetMonthKey(value: Date, offset: number): string {
  const date = new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth() + offset, 1),
  );
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function percentVariation(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
}
const pageItems = <T>(
  items: T[],
  page: number,
  pageSize: number,
): Paginated<T> => {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    total,
    totalPages,
  };
};

export async function getDashboardIndicators(): Promise<DashboardIndicators> {
  await wait();
  const documentStatuses = mockDocumentos.map((item) =>
    calcularStatusDocumento(item.dataValidade),
  );
  const count = (values: DocumentoStatus[], status: DocumentoStatus) =>
    values.filter((value) => value === status).length;
  const valid = count(documentStatuses, "Válido");
  const due = count(documentStatuses, "Próximo do vencimento");
  const expired = count(documentStatuses, "Expirado");
  const completed = mockTarefas.filter(
    (task) => task.status === "Concluída",
  ).length;
  const inProgress = mockTarefas.filter(
    (task) => task.status === "Em andamento",
  ).length;
  const pending = mockTarefas.filter(
    (task) => task.status === "Pendente",
  ).length;
  const activeUnits = mockUnidades.filter(
    (unit) => unit.status === "Ativa",
  ).length;

  return {
    unidades: [
      { label: "Ativas", value: activeUnits, color: "#16A34A" },
      {
        label: "Inativas",
        value: mockUnidades.length - activeUnits,
        color: "#EF4444",
      },
    ],
    documentos: [
      { label: "Válido", value: valid, color: "#22C55E" },
      { label: "Próximo do vencimento", value: due, color: "#FACC15" },
      { label: "Expirado", value: expired, color: "#EF4444" },
    ],
    tarefas: [
      { label: "Concluída", value: completed, color: "#22C55E" },
      { label: "Em andamento", value: inProgress, color: "#FACC15" },
      { label: "Pendente", value: pending, color: "#EF4444" },
    ],
    totalPendencias: due + expired + pending + inProgress,
    documentosAVencer: due,
    tarefasConcluidas: completed,
    variacaoDocumentosAVencer: Math.round(((due - 18) / 18) * 100),
    variacaoTarefasConcluidas: Math.round(((completed - 38) / 38) * 100),
  };
}

export async function getDashboardDocuments(
  filters: DocumentFilters,
): Promise<Paginated<Documento>> {
  await wait();
  const search = normalize(filters.search);
  const filtered = mockDocumentos.filter((document) => {
    const matchesSearch =
      !search || document.nome.toLocaleLowerCase("pt-BR").includes(search);
    const matchesUnit =
      filters.unidadeId === "todas" || document.unidadeId === filters.unidadeId;
    const matchesCategory =
      filters.categoria === "todas" || document.categoria === filters.categoria;
    const matchesStatus =
      filters.status === "Todos" ||
      calcularStatusDocumento(document.dataValidade) === filters.status;
    return matchesSearch && matchesUnit && matchesCategory && matchesStatus;
  });
  return pageItems(filtered, filters.page, filters.pageSize);
}

export async function getDashboardTasks(
  filters: TaskFilters,
): Promise<Paginated<Tarefa>> {
  await wait();
  const search = normalize(filters.search);
  const filtered = mockTarefas.filter((task) => {
    const matchesSearch =
      !search || task.titulo.toLocaleLowerCase("pt-BR").includes(search);
    const matchesUnit =
      filters.unidadeId === "todas" || task.unidadeId === filters.unidadeId;
    const matchesStatus =
      filters.status === "Todos" || task.status === filters.status;
    return matchesSearch && matchesUnit && matchesStatus;
  });
  return pageItems(filtered, filters.page, filters.pageSize);
}

export async function obterUnidade(id: string): Promise<Unidade | null> {
  await wait(120);
  return mockUnidades.find((unidade) => unidade.id === id) ?? null;
}

export async function obterIndicadoresUnidade(
  unidadeId: string,
): Promise<UnidadeIndicadores | null> {
  await wait(160);
  if (!mockUnidades.some((unidade) => unidade.id === unidadeId)) return null;

  const unidadeDocumentos = mockDocumentos.filter(
    (documento) => documento.unidadeId === unidadeId,
  );
  const unidadeTarefas = mockTarefas.filter(
    (tarefa) => tarefa.unidadeId === unidadeId,
  );
  const statusDocumentos = unidadeDocumentos.map((documento) =>
    calcularStatusDocumento(documento.dataValidade),
  );
  const countDocumentStatus = (status: DocumentoStatus) =>
    statusDocumentos.filter((current) => current === status).length;
  const countTasks = (status: TarefaStatus) =>
    unidadeTarefas.filter((tarefa) => tarefa.status === status).length;
  const documentsExpired = countDocumentStatus("Expirado");
  const tasksCompleted = countTasks("Concluída");

  const now = new Date();
  const currentMonth = monthKey(now.toISOString()) ?? "";
  const previousMonth = offsetMonthKey(now, -1);
  const expiredThisMonth = unidadeDocumentos.filter(
    (documento, index) =>
      statusDocumentos[index] === "Expirado" &&
      monthKey(documento.dataValidade) === currentMonth,
  ).length;
  const expiredPreviousMonth = unidadeDocumentos.filter(
    (documento, index) =>
      statusDocumentos[index] === "Expirado" &&
      monthKey(documento.dataValidade) === previousMonth,
  ).length;
  const tasksCompletedThisMonth = unidadeTarefas.filter(
    (tarefa) =>
      tarefa.status === "Concluída" &&
      monthKey(tarefa.dataConclusao) === currentMonth,
  ).length;
  const tasksCompletedPreviousMonth = unidadeTarefas.filter(
    (tarefa) =>
      tarefa.status === "Concluída" &&
      monthKey(tarefa.dataConclusao) === previousMonth,
  ).length;

  return {
    documentos: [
      {
        label: "Válido",
        value: countDocumentStatus("Válido"),
        color: "#22C55E",
      },
      {
        label: "Próximo do vencimento",
        value: countDocumentStatus("Próximo do vencimento"),
        color: "#FACC15",
      },
      { label: "Expirado", value: documentsExpired, color: "#EF4444" },
    ],
    tarefas: [
      { label: "Concluída", value: tasksCompleted, color: "#22C55E" },
      {
        label: "Em andamento",
        value: countTasks("Em andamento"),
        color: "#FACC15",
      },
      { label: "Pendente", value: countTasks("Pendente"), color: "#EF4444" },
    ],
    documentosExpirados: documentsExpired,
    tarefasConcluidas: tasksCompleted,
    variacaoDocumentosExpirados: percentVariation(
      expiredThisMonth,
      expiredPreviousMonth,
    ),
    variacaoTarefasConcluidas: percentVariation(
      tasksCompletedThisMonth,
      tasksCompletedPreviousMonth,
    ),
  };
}

export async function alterarStatusUnidade(
  id: string,
  status: UnidadeStatus,
  perfil: PerfilUsuario = mockUsuarioSessao.perfil,
): Promise<Unidade> {
  await wait(120);
  if (perfil !== "Administrador") throw new PerfilSemPermissaoError();
  const unidadeIndex = mockUnidades.findIndex((unidade) => unidade.id === id);
  if (unidadeIndex < 0) throw new RecursoNaoEncontradoError("Unidade");

  const unidade = mockUnidades[unidadeIndex];
  const updated: Unidade = {
    ...unidade,
    status,
    atualizadoEm: new Date().toISOString(),
  };
  mockUnidades[unidadeIndex] = updated;
  return updated;
}

export async function alterarStatusTarefa(
  tarefaId: string,
  status: TarefaStatus,
): Promise<Tarefa> {
  await wait(120);
  const tarefaIndex = mockTarefas.findIndex((tarefa) => tarefa.id === tarefaId);
  if (tarefaIndex < 0) throw new RecursoNaoEncontradoError("Tarefa");

  const tarefa = mockTarefas[tarefaIndex];
  const unidade = mockUnidades.find((item) => item.id === tarefa.unidadeId);
  if (!unidade) throw new RecursoNaoEncontradoError("Unidade");
  if (unidade.status === "Inativa") throw new UnidadeInativaError();

  const updated: Tarefa = {
    ...tarefa,
    status,
    dataConclusao: status === "Concluída" ? new Date().toISOString() : null,
  };
  mockTarefas[tarefaIndex] = updated;
  const unidadeIndex = mockUnidades.findIndex((item) => item.id === unidade.id);
  mockUnidades[unidadeIndex] = {
    ...unidade,
    atualizadoEm: new Date().toISOString(),
  };
  return updated;
}
