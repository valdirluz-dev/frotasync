import { http, ApiError } from "@/lib/http";
import { normalizarCep } from "@/lib/cep";
import {
  IdentificadorUnidadeDuplicadoError,
  RecursoNaoEncontradoError,
  PerfilSemPermissaoError,
} from "@/lib/errors";
import { STATUS_COLORS } from "@/lib/statusColors";
import type { UnidadeFormValues } from "@/schemas/unidade";
import type {
  Paginated,
  Unidade,
  UnidadeListItem,
  UnidadesFilters,
  UnidadeIndicadores,
  UnidadeStatus,
  PerfilUsuario,
  DashboardDistribution,
} from "@/types/domain";

const DEFAULT_PAGE_SIZE = 12;

type UnidadeApiResponse = {
  id: string;
  nome: string;
  codigo: string;
  status: "ativa" | "inativa";
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
  descricao?: string;
  criadoEm: string;
  atualizadoEm: string;
  totalDocumentos?: number;
  totalTarefas?: number;
};

type IndicadoresApiResponse = {
  unidadeId: string;
  totalPendencias: number;
  documentos: {
    total: number;
    valido: number;
    proximoVencimento: number;
    expirado: number;
  };
  tarefas: {
    total: number;
    pendente: number;
    emAndamento: number;
    concluida: number;
  };
  variacao: {
    referencia: "mes_anterior";
    documentosProximosVencimento: {
      atual: number;
      anterior: number;
      percentual: number | null;
    };
    documentosExpirados: {
      atual: number;
      anterior: number;
      percentual: number | null;
    };
    tarefasConcluidas: {
      atual: number;
      anterior: number;
      percentual: number | null;
    };
  };
};

function mapearUnidadeApi(unidade: UnidadeApiResponse): Unidade {
  return {
    id: unidade.id,
    nome: unidade.nome,
    codigo: unidade.codigo,
    status: unidade.status === "ativa" ? "Ativa" : "Inativa",
    endereco: {
      cep: unidade.endereco.cep,
      logradouro: unidade.endereco.logradouro,
      numero: unidade.endereco.numero,
      complemento: unidade.endereco.complemento || undefined,
      bairro: unidade.endereco.bairro,
      cidade: unidade.endereco.cidade,
      uf: unidade.endereco.uf as Unidade["endereco"]["uf"],
    },
    descricao: unidade.descricao || undefined,
    criadoEm: unidade.criadoEm,
    atualizadoEm: unidade.atualizadoEm,
  };
}

function mapearErroApi(error: unknown): never {
  if (!(error instanceof ApiError)) throw error;

  if (
    error.status === 409 ||
    error.response.codigo === "IDENTIFICADOR_DUPLICADO"
  ) {
    throw new IdentificadorUnidadeDuplicadoError();
  }

  if (error.status === 404) {
    throw new RecursoNaoEncontradoError("Unidade");
  }

  if (error.status === 403) {
    throw new PerfilSemPermissaoError();
  }

  throw error;
}

async function executarApi<T>(request: () => Promise<T>): Promise<T> {
  try {
    return await request();
  } catch (error) {
    mapearErroApi(error);
  }
}

function mapearPayload(data: UnidadeFormValues) {
  return {
    nome: data.nome.trim(),
    codigo: data.identificador.trim(),
    cep: normalizarCep(data.cep),
    logradouro: data.logradouro.trim(),
    numero: data.numero.trim(),
    complemento: data.complemento?.trim() || undefined,
    bairro: data.bairro.trim(),
    cidade: data.cidade.trim(),
    uf: data.uf,
    descricao: data.descricao?.trim() || undefined,
  };
}

export async function listarUnidades({
  page = 1,
  size = DEFAULT_PAGE_SIZE,
  q = "",
  status = "Todos",
}: UnidadesFilters = {}): Promise<Paginated<UnidadeListItem>> {
  const params: Record<string, string | number> = {
    page: Math.max(1, Math.floor(page)),
    pageSize: Math.max(1, Math.floor(size)),
  };

  if (q.trim()) params.q = q.trim();

  if (status !== "Todos") {
    params.status = status === "Ativa" ? "ativa" : "inativa";
  }

  const response = await executarApi(() =>
    http<Paginated<UnidadeApiResponse>>("/unidades", { params }),
  );

  return {
    ...response,
    items: response.items.map((unidade) => ({
      ...mapearUnidadeApi(unidade),
      totalDocumentos: unidade.totalDocumentos ?? 0,
      totalTarefas: unidade.totalTarefas ?? 0,
    })),
  };
}

export async function criarUnidade(data: UnidadeFormValues): Promise<Unidade> {
  const response = await executarApi(() =>
    http<UnidadeApiResponse>("/unidades", {
      method: "POST",
      body: mapearPayload(data),
    }),
  );

  return mapearUnidadeApi(response);
}

export async function obterUnidadeParaEdicao(
  id: string,
): Promise<Unidade | null> {
  try {
    return await obterUnidade(id);
  } catch (error) {
    if (error instanceof RecursoNaoEncontradoError) return null;
    throw error;
  }
}

export async function atualizarUnidade(
  id: string,
  data: UnidadeFormValues,
): Promise<Unidade> {
  const response = await executarApi(() =>
    http<UnidadeApiResponse>(`/unidades/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: mapearPayload(data),
    }),
  );

  return mapearUnidadeApi(response);
}

export async function obterUnidade(id: string): Promise<Unidade> {
  const response = await executarApi(() =>
    http<UnidadeApiResponse>(`/unidades/${encodeURIComponent(id)}`),
  );

  return mapearUnidadeApi(response);
}

export async function obterIndicadoresUnidade(
  unidadeId: string,
): Promise<UnidadeIndicadores | null> {
  let response: IndicadoresApiResponse;

  try {
    response = await http<IndicadoresApiResponse>(
      `/unidades/${encodeURIComponent(unidadeId)}/indicadores`,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    mapearErroApi(error);
  }

  const documentos: DashboardDistribution[] = [
    {
      label: "Válido",
      value: response.documentos.valido,
      color: STATUS_COLORS.completed,
    },
    {
      label: "Próximo do vencimento",
      value: response.documentos.proximoVencimento,
      color: STATUS_COLORS.due,
    },
    {
      label: "Expirado",
      value: response.documentos.expirado,
      color: STATUS_COLORS.expired,
    },
  ];

  const tarefas: DashboardDistribution[] = [
    {
      label: "Concluída",
      value: response.tarefas.concluida,
      color: STATUS_COLORS.completed,
    },
    {
      label: "Em andamento",
      value: response.tarefas.emAndamento,
      color: STATUS_COLORS.due,
    },
    {
      label: "Pendente",
      value: response.tarefas.pendente,
      color: STATUS_COLORS.pending,
    },
  ];

  return {
    documentos,
    tarefas,
    documentosExpirados: response.documentos.expirado,
    tarefasConcluidas: response.tarefas.concluida,
    variacaoDocumentosExpirados:
      response.variacao.documentosExpirados.percentual,
    variacaoTarefasConcluidas:
      response.variacao.tarefasConcluidas.percentual,
  };
}

export async function alterarStatusUnidade(
  id: string,
  status: UnidadeStatus,
  perfil: PerfilUsuario = "Colaborador",
): Promise<Unidade> {
  // O backend é a autoridade sobre autorização; o perfil local não bloqueia a requisição.
  void perfil;

  const response = await executarApi(() =>
    http<UnidadeApiResponse>(`/unidades/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: {
        status: status === "Ativa" ? "ativa" : "inativa",
      },
    }),
  );

  return mapearUnidadeApi(response);
}
