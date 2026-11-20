import { mockHistoricoUnidades } from "@/mocks/historicoUnidades";
import { usuarioLogadoAtual } from "@/mocks/authStore";
import { mockUnidades } from "@/mocks/dashboard";
import { wait } from "@/lib/mockApi";
import type {
  HistoricoUnidadeEvento,
  HistoricoFilters,
  Paginated,
} from "@/types/domain";

const DEFAULT_PAGE_SIZE = 10;

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

function paginateHistorico(
  items: HistoricoUnidadeEvento[],
  page: number,
  pageSize: number,
): Paginated<HistoricoUnidadeEvento> {
  const safeSize = Math.max(1, Math.floor(pageSize));
  const ordered = [...items].sort(
    (left, right) =>
      right.criadoEm.localeCompare(left.criadoEm) ||
      right.id.localeCompare(left.id),
  );
  const total = ordered.length;
  const totalPages = Math.max(1, Math.ceil(total / safeSize));
  const safePage = Math.min(Math.max(1, Math.floor(page)), totalPages);
  const start = (safePage - 1) * safeSize;

  return {
    items: ordered.slice(start, start + safeSize),
    page: safePage,
    pageSize: safeSize,
    total,
    totalPages,
  };
}

type NovoEvento = Omit<HistoricoUnidadeEvento, "id" | "usuario" | "criadoEm">;

export function registrarEventoHistoricoUnidade(evento: NovoEvento): void {
  const nextSequence =
    mockHistoricoUnidades.reduce((maximum, item) => {
      const matched = /^history-(\d+)$/.exec(item.id);
      return Math.max(maximum, matched ? Number(matched[1]) : 0);
    }, 0) + 1;

  mockHistoricoUnidades.push({
    ...evento,
    id: `history-${String(nextSequence).padStart(6, "0")}`,
    usuario: usuarioLogadoAtual.nome,
    criadoEm: new Date().toISOString(),
  });
}

export async function listarHistoricoUnidade(
  unidadeId: string,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<Paginated<HistoricoUnidadeEvento>> {
  await wait();

  return paginateHistorico(
    mockHistoricoUnidades.filter((evento) => evento.unidadeId === unidadeId),
    page,
    pageSize,
  );
}

export async function listarHistoricoGlobal({
  page,
  pageSize = DEFAULT_PAGE_SIZE,
  search,
  unidadeId,
  entidade,
}: HistoricoFilters): Promise<Paginated<HistoricoUnidadeEvento>> {
  await wait();
  const query = normalizeSearch(search);
  const filtered = mockHistoricoUnidades.filter((evento) => {
    if (unidadeId !== "todas" && evento.unidadeId !== unidadeId) return false;
    if (entidade !== "Todas" && evento.entidade !== entidade) return false;
    if (!query) return true;

    const unidadeNome =
      mockUnidades.find((unidade) => unidade.id === evento.unidadeId)?.nome ?? "";
    return [
      evento.acao,
      evento.usuario,
      evento.entidade,
      evento.entidadeNome,
      unidadeNome,
    ].some((value) => normalizeSearch(value).includes(query));
  });

  return paginateHistorico(filtered, page, pageSize);
}
