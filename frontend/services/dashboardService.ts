import { calcularStatusDocumento } from "@/lib/status";
import { mockDocumentos, mockTarefas, mockUnidades } from "@/mocks/dashboard";
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
} from "@/types/domain";
import { mockUsuarioSessao } from "@/mocks/sessao";
import {
  UnidadeInativaError,
  RecursoNaoEncontradoError,
  PerfilSemPermissaoError,
} from "@/lib/errors";
import { wait } from "@/lib/mockApi";
import { monthKey, offsetMonthKey, percentVariation } from "@/lib/month";
import { STATUS_COLORS } from "@/lib/statusColors";

const normalize = (value: string) => value.trim().toLocaleLowerCase("pt-BR");

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

  const now = new Date();
  const currentMonth = monthKey(now.toISOString()) ?? "";
  const previousMonth = offsetMonthKey(now, -1);
  const dueThisMonth = mockDocumentos.filter(
    (documento) =>
      calcularStatusDocumento(documento.dataValidade) === "Próximo do vencimento" &&
      monthKey(documento.dataValidade) === currentMonth,
  ).length;
  const duePreviousMonth = mockDocumentos.filter(
    (documento) =>
      calcularStatusDocumento(documento.dataValidade) === "Próximo do vencimento" &&
      monthKey(documento.dataValidade) === previousMonth,
  ).length;
  const completedThisMonth = mockTarefas.filter(
    (tarefa) =>
      tarefa.status === "Concluída" &&
      monthKey(tarefa.dataConclusao) === currentMonth,
  ).length;
  const completedPreviousMonth = mockTarefas.filter(
    (tarefa) =>
      tarefa.status === "Concluída" &&
      monthKey(tarefa.dataConclusao) === previousMonth,
  ).length;

  return {
    unidades: [
      { label: "Ativas", value: activeUnits, color: STATUS_COLORS.active },
      {
        label: "Inativas",
        value: mockUnidades.length - activeUnits,
        color: STATUS_COLORS.inactive,
      },
    ],
    documentos: [
      { label: "Válido", value: valid, color: STATUS_COLORS.valid },
      { label: "Próximo do vencimento", value: due, color: STATUS_COLORS.due },
      { label: "Expirado", value: expired, color: STATUS_COLORS.expired },
    ],
    tarefas: [
      { label: "Concluída", value: completed, color: STATUS_COLORS.completed },
      { label: "Em andamento", value: inProgress, color: STATUS_COLORS.inProgress },
      { label: "Pendente", value: pending, color: STATUS_COLORS.pending },
    ],
    totalPendencias: due + expired + pending + inProgress,
    documentosAVencer: due,
    tarefasConcluidas: completed,
    variacaoDocumentosAVencer: percentVariation(dueThisMonth, duePreviousMonth),
    variacaoTarefasConcluidas: percentVariation(completedThisMonth, completedPreviousMonth),
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

