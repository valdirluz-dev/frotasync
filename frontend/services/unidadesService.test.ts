import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, http } from "@/lib/http";
import {
  IdentificadorUnidadeDuplicadoError,
  PerfilSemPermissaoError,
  RecursoNaoEncontradoError,
} from "@/lib/errors";
import type { Paginated } from "@/types/domain";
import {
  alterarStatusUnidade,
  atualizarUnidade,
  criarUnidade,
  listarUnidades,
  obterIndicadoresUnidade,
  obterUnidade,
  obterUnidadeParaEdicao,
} from "./unidadesService";

vi.mock("@/lib/http", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/http")>();

  return {
    ...actual,
    http: vi.fn(),
  };
});

const httpMock = vi.mocked(http);

afterEach(() => {
  vi.clearAllMocks();
});

const agora = "2026-11-24T00:00:00.000Z";

const unidadeApi = {
  id: "unidade-123",
  nome: "Unidade Central",
  codigo: "UC-001",
  status: "ativa" as const,
  endereco: {
    cep: "50030230",
    logradouro: "Avenida Conde da Boa Vista",
    numero: "100",
    complemento: "Sala 2",
    bairro: "Boa Vista",
    cidade: "Recife",
    uf: "PE",
  },
  descricao: "Unidade principal",
  criadoEm: agora,
  atualizadoEm: agora,
  totalDocumentos: 15,
  totalTarefas: 8,
};

const unidadeApiInativa = {
  ...unidadeApi,
  status: "inativa" as const,
};

const dadosFormulario = {
  nome: "  Unidade Central  ",
  identificador: "  UC-001  ",
  cep: "50030-230",
  logradouro: "  Avenida Conde da Boa Vista  ",
  numero: " 100 ",
  complemento: " Sala 2 ",
  bairro: " Boa Vista ",
  cidade: " Recife ",
  uf: "PE" as const,
  descricao: " Unidade principal ",
};

function criarErroApi(
  status: number,
  message: string,
  codigo?: string,
): ApiError {
  return new ApiError(status, {
    timestamp: agora,
    status,
    error: status === 404 ? "Not Found" : "Error",
    codigo,
    message,
    path: "/api/v1/unidades",
    erros: [],
  });
}

describe("listarUnidades", () => {
  it("consulta a API com paginação padrão e mapeia os dados", async () => {
    const resposta: Paginated<typeof unidadeApi> = {
      items: [unidadeApi],
      page: 1,
      pageSize: 12,
      total: 1,
      totalPages: 1,
    };

    httpMock.mockResolvedValue(resposta);

    const resultado = await listarUnidades();

    expect(httpMock).toHaveBeenCalledWith("/unidades", {
      params: { page: 1, pageSize: 12 },
    });

    expect(resultado).toEqual({
      ...resposta,
      items: [
        {
          id: "unidade-123",
          nome: "Unidade Central",
          codigo: "UC-001",
          status: "Ativa",
          endereco: {
            cep: "50030230",
            logradouro: "Avenida Conde da Boa Vista",
            numero: "100",
            complemento: "Sala 2",
            bairro: "Boa Vista",
            cidade: "Recife",
            uf: "PE",
          },
          descricao: "Unidade principal",
          criadoEm: agora,
          atualizadoEm: agora,
          totalDocumentos: 15,
          totalTarefas: 8,
        },
      ],
    });
  });

  it("envia busca e filtro de status para a API", async () => {
    httpMock.mockResolvedValue({
      items: [],
      page: 2,
      pageSize: 5,
      total: 0,
      totalPages: 0,
    });

    await listarUnidades({
      page: 2,
      size: 5,
      q: "  Central  ",
      status: "Inativa",
    });

    expect(httpMock).toHaveBeenCalledWith("/unidades", {
      params: {
        page: 2,
        pageSize: 5,
        q: "Central",
        status: "inativa",
      },
    });
  });

  it("normaliza paginação inválida para valores mínimos", async () => {
    httpMock.mockResolvedValue({
      items: [],
      page: 1,
      pageSize: 1,
      total: 0,
      totalPages: 0,
    });

    await listarUnidades({ page: 0, size: 0 });

    expect(httpMock).toHaveBeenCalledWith("/unidades", {
      params: { page: 1, pageSize: 1 },
    });
  });

  it("usa valores padrão de totais quando ausentes na API", async () => {
    httpMock.mockResolvedValue({
      items: [{ ...unidadeApi, totalDocumentos: undefined, totalTarefas: undefined }],
      page: 1,
      pageSize: 12,
      total: 1,
      totalPages: 1,
    });

    const resultado = await listarUnidades();

    expect(resultado.items[0]).toMatchObject({
      totalDocumentos: 0,
      totalTarefas: 0,
    });
  });
});

describe("criarUnidade", () => {
  it("envia payload normalizado e mapeia a unidade retornada", async () => {
    httpMock.mockResolvedValue(unidadeApi);

    const resultado = await criarUnidade(dadosFormulario);

    expect(httpMock).toHaveBeenCalledWith("/unidades", {
      method: "POST",
      body: {
        nome: "Unidade Central",
        codigo: "UC-001",
        cep: "50030230",
        logradouro: "Avenida Conde da Boa Vista",
        numero: "100",
        complemento: "Sala 2",
        bairro: "Boa Vista",
        cidade: "Recife",
        uf: "PE",
        descricao: "Unidade principal",
      },
    });

    expect(resultado).toMatchObject({
      id: "unidade-123",
      nome: "Unidade Central",
      codigo: "UC-001",
      status: "Ativa",
    });
  });

  it("converte erro 409 de identificador duplicado", async () => {
    httpMock.mockRejectedValue(
      criarErroApi(409, "Identificador já cadastrado", "IDENTIFICADOR_DUPLICADO"),
    );

    await expect(criarUnidade(dadosFormulario)).rejects.toBeInstanceOf(
      IdentificadorUnidadeDuplicadoError,
    );
  });
});

describe("atualizarUnidade", () => {
  it("envia PUT com identificador codificado e payload normalizado", async () => {
    httpMock.mockResolvedValue(unidadeApi);

    await atualizarUnidade("id com espaço", dadosFormulario);

    expect(httpMock).toHaveBeenCalledWith(
      "/unidades/id%20com%20espa%C3%A7o",
      {
        method: "PUT",
        body: {
          nome: "Unidade Central",
          codigo: "UC-001",
          cep: "50030230",
          logradouro: "Avenida Conde da Boa Vista",
          numero: "100",
          complemento: "Sala 2",
          bairro: "Boa Vista",
          cidade: "Recife",
          uf: "PE",
          descricao: "Unidade principal",
        },
      },
    );
  });
});

describe("obterUnidade", () => {
  it("consulta pelo ID e mapeia unidade ativa", async () => {
    httpMock.mockResolvedValue(unidadeApi);

    const resultado = await obterUnidade("unidade-123");

    expect(httpMock).toHaveBeenCalledWith("/unidades/unidade-123");
    expect(resultado).toMatchObject({
      id: "unidade-123",
      status: "Ativa",
      endereco: { cidade: "Recife", uf: "PE" },
    });
  });

  it("mapeia unidade inativa", async () => {
    httpMock.mockResolvedValue(unidadeApiInativa);

    await expect(obterUnidade("unidade-123")).resolves.toMatchObject({
      status: "Inativa",
    });
  });

  it("converte 404 em RecursoNaoEncontradoError", async () => {
    httpMock.mockRejectedValue(criarErroApi(404, "Unidade não encontrada."));

    await expect(obterUnidade("inexistente")).rejects.toBeInstanceOf(
      RecursoNaoEncontradoError,
    );
  });
});

describe("obterUnidadeParaEdicao", () => {
  it("retorna a unidade quando encontrada", async () => {
    httpMock.mockResolvedValue(unidadeApi);

    await expect(obterUnidadeParaEdicao("unidade-123")).resolves.toMatchObject({
      id: "unidade-123",
      nome: "Unidade Central",
    });
  });

  it("retorna null quando a unidade não existe", async () => {
    httpMock.mockRejectedValue(criarErroApi(404, "Unidade não encontrada."));

    await expect(obterUnidadeParaEdicao("inexistente")).resolves.toBeNull();
  });

  it("propaga erros diferentes de 404", async () => {
    const erro = criarErroApi(503, "Serviço indisponível");
    httpMock.mockRejectedValue(erro);

    await expect(obterUnidadeParaEdicao("unidade-123")).rejects.toBe(erro);
  });
});

describe("obterIndicadoresUnidade", () => {
  const indicadoresApi = {
    unidadeId: "unidade-123",
    totalPendencias: 10,
    documentos: {
      total: 20,
      valido: 12,
      proximoVencimento: 5,
      expirado: 3,
    },
    tarefas: {
      total: 15,
      pendente: 4,
      emAndamento: 6,
      concluida: 5,
    },
    variacao: {
      referencia: "mes_anterior" as const,
      documentosProximosVencimento: {
        atual: 5,
        anterior: 4,
        percentual: 25,
      },
      documentosExpirados: {
        atual: 3,
        anterior: 2,
        percentual: 50,
      },
      tarefasConcluidas: {
        atual: 5,
        anterior: 4,
        percentual: 25,
      },
    },
  };

  it("consulta indicadores e mapeia distribuições e variações", async () => {
    httpMock.mockResolvedValue(indicadoresApi);

    const resultado = await obterIndicadoresUnidade("unidade-123");

    expect(httpMock).toHaveBeenCalledWith(
      "/unidades/unidade-123/indicadores",
    );

    expect(resultado).toMatchObject({
      documentosExpirados: 3,
      tarefasConcluidas: 5,
      variacaoDocumentosExpirados: 50,
      variacaoTarefasConcluidas: 25,
      documentos: [
        { label: "Válido", value: 12 },
        { label: "Próximo do vencimento", value: 5 },
        { label: "Expirado", value: 3 },
      ],
      tarefas: [
        { label: "Concluída", value: 5 },
        { label: "Em andamento", value: 6 },
        { label: "Pendente", value: 4 },
      ],
    });
  });

  it("retorna null quando a API responde 404", async () => {
    httpMock.mockRejectedValue(criarErroApi(404, "Unidade não encontrada."));

    await expect(obterIndicadoresUnidade("inexistente")).resolves.toBeNull();
  });

  it("propaga erros diferentes de 404", async () => {
    const erro = criarErroApi(503, "Serviço indisponível");
    httpMock.mockRejectedValue(erro);

    await expect(obterIndicadoresUnidade("unidade-123")).rejects.toBe(erro);
  });
});

describe("alterarStatusUnidade", () => {
  it("envia PATCH com status inativo", async () => {
    httpMock.mockResolvedValue(unidadeApiInativa);

    const resultado = await alterarStatusUnidade(
      "unidade-123",
      "Inativa",
      "Administrador",
    );

    expect(httpMock).toHaveBeenCalledWith("/unidades/unidade-123/status", {
      method: "PATCH",
      body: { status: "inativa" },
    });

    expect(resultado.status).toBe("Inativa");
  });

  it("envia PATCH com status ativo", async () => {
    httpMock.mockResolvedValue(unidadeApi);

    const resultado = await alterarStatusUnidade(
      "unidade-123",
      "Ativa",
      "Administrador",
    );

    expect(httpMock).toHaveBeenCalledWith("/unidades/unidade-123/status", {
      method: "PATCH",
      body: { status: "ativa" },
    });

    expect(resultado.status).toBe("Ativa");
  });

  it("converte erro 403 em PerfilSemPermissaoError", async () => {
    httpMock.mockRejectedValue(criarErroApi(403, "Sem permissão"));

    await expect(
      alterarStatusUnidade("unidade-123", "Inativa"),
    ).rejects.toBeInstanceOf(PerfilSemPermissaoError);
  });
});
