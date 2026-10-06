import { mockDocumentos, mockTarefas, mockUnidades } from "../mocks/dashboard";
import type {
  Paginated,
  UnidadeListItem,
  UnidadesFilters,
} from "../types/dashboard";

const DEFAULT_PAGE_SIZE = 12;
const SIMULATED_LATENCY_MS = 120;

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

export async function listarUnidades({
  page = 1,
  size = DEFAULT_PAGE_SIZE,
  q = "",
  status = "Todos",
}: UnidadesFilters = {}): Promise<Paginated<UnidadeListItem>> {
  await new Promise<void>((resolve) =>
    setTimeout(resolve, SIMULATED_LATENCY_MS),
  );

  const query = normalizeSearch(q);
  const filtered = mockUnidades
    .filter((unidade) => {
      const matchesQuery =
        !query ||
        normalizeSearch(unidade.nome).includes(query) ||
        normalizeSearch(unidade.codigo).includes(query);
      const matchesStatus = status === "Todos" || unidade.status === status;
      return matchesQuery && matchesStatus;
    })
    .map((unidade) => ({
      ...unidade,
      totalDocumentos: mockDocumentos.filter(
        (documento) => documento.unidadeId === unidade.id,
      ).length,
      totalTarefas: mockTarefas.filter(
        (tarefa) => tarefa.unidadeId === unidade.id,
      ).length,
    }));

  const safeSize = Math.max(1, Math.floor(size));
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / safeSize));
  const safePage = Math.min(Math.max(1, Math.floor(page)), totalPages);
  const start = (safePage - 1) * safeSize;

  return {
    items: filtered.slice(start, start + safeSize),
    page: safePage,
    pageSize: safeSize,
    total,
    totalPages,
  };
}
