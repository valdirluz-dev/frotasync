import { calcularStatusDocumento } from "@/lib/status";
import { STATUS_COLORS } from "@/lib/statusColors";
import {
  IdentificadorUnidadeDuplicadoError,
  PerfilSemPermissaoError,
  RecursoNaoEncontradoError,
} from "@/lib/errors";
import { monthKey, offsetMonthKey, percentVariation } from "@/lib/month";
import { repositories } from "@/repositories";
import type { UnidadeFormValues } from "@/schemas/unidade";
import type {
  Paginated,
  PerfilUsuario,
  Unidade,
  UnidadeIndicadores,
  UnidadeListItem,
  UnidadeStatus,
  UnidadesFilters,
} from "@/types/domain";

const DEFAULT_PAGE_SIZE = 12;

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
  const [unidades, documentos, tarefas] = await Promise.all([
    repositories.unidades.list(),
    repositories.documentos.list(),
    repositories.tarefas.list(),
  ]);
  const query = normalizeSearch(q);
  const filtered = unidades
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
      totalDocumentos: documentos.filter(
        (documento) => documento.unidadeId === unidade.id,
      ).length,
      totalTarefas: tarefas.filter((tarefa) => tarefa.unidadeId === unidade.id)
        .length,
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

export async function listarTodasUnidades(): Promise<Unidade[]> {
  return repositories.unidades.list();
}

export async function criarUnidade(data: UnidadeFormValues): Promise<Unidade> {
  const unidades = await repositories.unidades.list();
  const identificador = data.identificador.trim();
  const duplicate = unidades.some(
    (unidade) =>
      normalizeSearch(unidade.codigo) === normalizeSearch(identificador),
  );
  if (duplicate) throw new IdentificadorUnidadeDuplicadoError();

  const timestamp = new Date().toISOString();
  const unidade = {
    nome: data.nome.trim(),
    codigo: identificador,
    status: "Ativa" as const,
    endereco: {
      logradouro: data.logradouro.trim(),
      numero: data.numero.trim(),
      bairro: data.bairro.trim(),
      cidade: data.cidade.trim(),
      uf: data.uf,
      cep: data.cep,
      complemento: data.complemento?.trim() || undefined,
    },
    descricao: data.descricao?.trim() || undefined,
    criadoEm: timestamp,
    atualizadoEm: timestamp,
  };

  return repositories.unidades.insert(unidade);
}

export async function obterUnidadeParaEdicao(
  id: string,
): Promise<Unidade | null> {
  return repositories.unidades.findById(id);
}

export async function atualizarUnidade(
  id: string,
  data: UnidadeFormValues,
): Promise<Unidade> {
  const current = await repositories.unidades.findById(id);
  if (!current) throw new RecursoNaoEncontradoError("Unidade");

  const identificador = data.identificador.trim();
  const unidades = await repositories.unidades.list();
  const duplicate = unidades.some(
    (unidade) =>
      unidade.id !== id &&
      normalizeSearch(unidade.codigo) === normalizeSearch(identificador),
  );
  if (duplicate) throw new IdentificadorUnidadeDuplicadoError();

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
      cep: data.cep,
    },
    descricao: data.descricao?.trim() || undefined,
    atualizadoEm: new Date().toISOString(),
  };
  return repositories.unidades.update(updated);
}

export async function obterUnidade(id: string): Promise<Unidade | null> {
  return repositories.unidades.findById(id);
}

export async function obterIndicadoresUnidade(
  unidadeId: string,
): Promise<UnidadeIndicadores | null> {
  const [unidade, documentos, tarefas] = await Promise.all([
    repositories.unidades.findById(unidadeId),
    repositories.documentos.list(),
    repositories.tarefas.list(),
  ]);
  if (!unidade) return null;

  const unidadeDocumentos = documentos.filter(
    (documento) => documento.unidadeId === unidadeId,
  );
  const unidadeTarefas = tarefas.filter(
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
      {
        label: "Válido",
        value: countDocumentStatus("Válido"),
        color: STATUS_COLORS.completed,
      },
      {
        label: "Próximo do vencimento",
        value: countDocumentStatus("Próximo do vencimento"),
        color: STATUS_COLORS.due,
      },
      {
        label: "Expirado",
        value: documentsExpired,
        color: STATUS_COLORS.expired,
      },
    ],
    tarefas: [
      {
        label: "Concluída",
        value: tasksCompleted,
        color: STATUS_COLORS.completed,
      },
      {
        label: "Em andamento",
        value: countTasks("Em andamento"),
        color: STATUS_COLORS.due,
      },
      {
        label: "Pendente",
        value: countTasks("Pendente"),
        color: STATUS_COLORS.pending,
      },
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
  perfil: PerfilUsuario,
): Promise<Unidade> {
  if (perfil !== "Administrador") throw new PerfilSemPermissaoError();
  const unidade = await repositories.unidades.findById(id);
  if (!unidade) throw new RecursoNaoEncontradoError("Unidade");

  const updated: Unidade = {
    ...unidade,
    status,
    atualizadoEm: new Date().toISOString(),
  };
  return repositories.unidades.update(updated);
}
