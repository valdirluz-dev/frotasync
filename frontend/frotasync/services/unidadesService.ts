import { mockDocumentos, mockTarefas, mockUnidades } from "../mocks/dashboard";
import { normalizarCep } from "../lib/cep";
import type { UnidadeFormValues } from "../schemas/unidade";
import type {
  Paginated,
  Unidade,
  UnidadeListItem,
  UnidadesFilters,
} from "../types/dashboard";

const DEFAULT_PAGE_SIZE = 12;
const SIMULATED_LATENCY_MS = 120;

export class IdentificadorUnidadeDuplicadoError extends Error {
  constructor() {
    super("Já existe uma unidade com este identificador");
    this.name = "IdentificadorUnidadeDuplicadoError";
  }
}

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

export async function criarUnidade(data: UnidadeFormValues): Promise<Unidade> {
  await new Promise<void>((resolve) =>
    setTimeout(resolve, SIMULATED_LATENCY_MS),
  );

  const identificador = data.identificador.trim();
  const duplicate = mockUnidades.some(
    (unidade) =>
      normalizeSearch(unidade.codigo) === normalizeSearch(identificador),
  );
  if (duplicate) throw new IdentificadorUnidadeDuplicadoError();

  const nextSequence =
    mockUnidades.reduce((maximum, unidade) => {
      const matched = /^u-(\d+)$/.exec(unidade.id);
      return Math.max(maximum, matched ? Number(matched[1]) : 0);
    }, 0) + 1;
  const timestamp = new Date().toISOString();

  const unidade: Unidade = {
    id: `u-${String(nextSequence).padStart(3, "0")}`,
    nome: data.nome.trim(),
    codigo: identificador,
    status: "Ativa",
    endereco: {
      logradouro: data.logradouro.trim(),
      numero: data.numero.trim(),
      bairro: data.bairro.trim(),
      cidade: data.cidade.trim(),
      uf: data.uf,
      cep: normalizarCep(data.cep),
      complemento: data.complemento?.trim() || undefined,
    },
    descricao: data.descricao?.trim() || undefined,
    criadoEm: timestamp,
    atualizadoEm: timestamp,
  };

  mockUnidades.push(unidade);
  return unidade;
}
