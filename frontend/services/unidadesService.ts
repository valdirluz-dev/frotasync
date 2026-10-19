import { mockDocumentos, mockTarefas, mockUnidades } from "@/mocks/dashboard";
import { normalizarCep } from "@/lib/cep";
import { IdentificadorUnidadeDuplicadoError } from "@/lib/errors";
import { wait } from "@/lib/mockApi";
import { STATUS_COLORS } from "@/lib/statusColors";
import { monthKey, offsetMonthKey, percentVariation } from "@/lib/month";
import type { UnidadeFormValues } from "@/schemas/unidade";
import type {
  Paginated,
  Unidade,
  UnidadeListItem,
  UnidadesFilters,
} from "@/types/domain";

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
  await wait();

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
  await wait();

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

export async function obterUnidadeParaEdicao(id: string): Promise<Unidade | null> {
  await wait();
  return mockUnidades.find((unidade) => unidade.id === id) ?? null;
}

export async function atualizarUnidade(id: string, data: UnidadeFormValues): Promise<Unidade> {
  await wait();
  const index = mockUnidades.findIndex((unidade) => unidade.id === id);
  if (index < 0) throw new Error("Unidade não encontrada.");
  const identificador = data.identificador.trim();
  const duplicate = mockUnidades.some(
    (unidade) => unidade.id !== id && normalizeSearch(unidade.codigo) === normalizeSearch(identificador),
  );
  if (duplicate) throw new IdentificadorUnidadeDuplicadoError();

  const current = mockUnidades[index];
  const updated: Unidade = {
    ...current,
    nome: data.nome.trim(),
    codigo: identificador,
    endereco: {
      logradouro: data.logradouro.trim(),
      numero: data.numero.trim(),
      complemento: data.complemento?.trim() || undefined,
      bairro: data.bairro.trim(),
      cidade: data.cidade.trim(),
      uf: data.uf,
      cep: normalizarCep(data.cep),
    },
    descricao: data.descricao?.trim() || undefined,
    atualizadoEm: new Date().toISOString(),
  };
  mockUnidades[index] = updated;
  return updated;
}

import { calcularStatusDocumento } from "@/lib/status";
import { mockUsuarioSessao } from "@/mocks/sessao";
import { PerfilSemPermissaoError, RecursoNaoEncontradoError } from "@/lib/errors";
import type { UnidadeIndicadores, UnidadeStatus, PerfilUsuario } from "@/types/domain";

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
  const countDocumentStatus = (status: string) =>
    statusDocumentos.filter((current) => current === status).length;
  const countTasks = (status: string) =>
    unidadeTarefas.filter((tarefa) => tarefa.status === status).length;
  const documentsExpired = countDocumentStatus("Expirado");
  const tasksCompleted = countTasks("Concluída");

  const now = new Date();
  const currentMonth = monthKey(now.toISOString()) ?? "";
  const previousMonth = offsetMonthKey(now, -1);
  const expiredThisMonth = unidadeDocumentos.filter(
    (documento, index) =>
      statusDocumentos[index] === "Expirado" &&
      documento.dataValidade?.slice(0, 7) === currentMonth,
  ).length;
  const expiredPreviousMonth = unidadeDocumentos.filter(
    (documento, index) =>
      statusDocumentos[index] === "Expirado" &&
      documento.dataValidade?.slice(0, 7) === previousMonth,
  ).length;
  const tasksCompletedThisMonth = unidadeTarefas.filter(
    (tarefa) =>
      tarefa.status === "Concluída" &&
      tarefa.dataConclusao?.slice(0, 7) === currentMonth,
  ).length;
  const tasksCompletedPreviousMonth = unidadeTarefas.filter(
    (tarefa) =>
      tarefa.status === "Concluída" &&
      tarefa.dataConclusao?.slice(0, 7) === previousMonth,
  ).length;

  return {
    documentos: [
      { label: "Válido", value: countDocumentStatus("Válido"), color: STATUS_COLORS.completed },
      { label: "Próximo do vencimento", value: countDocumentStatus("Próximo do vencimento"), color: STATUS_COLORS.due },
      { label: "Expirado", value: documentsExpired, color: STATUS_COLORS.expired },
    ],
    tarefas: [
      { label: "Concluída", value: tasksCompleted, color: STATUS_COLORS.completed },
      { label: "Em andamento", value: countTasks("Em andamento"), color: STATUS_COLORS.due },
      { label: "Pendente", value: countTasks("Pendente"), color: STATUS_COLORS.pending },
    ],
    documentosExpirados: documentsExpired,
    tarefasConcluidas: tasksCompleted,
    variacaoDocumentosExpirados: percentVariation(expiredThisMonth, expiredPreviousMonth),
    variacaoTarefasConcluidas: percentVariation(tasksCompletedThisMonth, tasksCompletedPreviousMonth),
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
