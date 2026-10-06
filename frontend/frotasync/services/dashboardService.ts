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
} from "@/types/dashboard";

const wait = (milliseconds = 180) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
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
