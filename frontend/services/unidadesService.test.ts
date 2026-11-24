import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/http";

import { mockUnidades } from "@/mocks/dashboard";
import { mockHistoricoUnidades } from "@/mocks/historicoUnidades";
import { IdentificadorUnidadeDuplicadoError } from "@/lib/errors";
import {
  criarUnidade,
  listarUnidades,
} from "./unidadesService";

describe("listarUnidades", () => {
  it("pagina 12 unidades por página e retorna a última página parcial", async () => {
    const firstPage = await listarUnidades({ page: 1 });
    const lastPage = await listarUnidades({ page: 3 });

    expect(firstPage.pageSize).toBe(12);
    expect(firstPage.items).toHaveLength(12);
    expect(firstPage.total).toBe(35);
    expect(lastPage.items).toHaveLength(11);
    expect(lastPage.totalPages).toBe(3);
  });

  it("busca por nome sem diferenciar acentos ou caixa", async () => {
    const result = await listarUnidades({ q: "vitoria" });

    expect(result.total).toBe(1);
    expect(result.items[0]?.nome).toBe("Vitória de Santo Antão");
  });

  it("busca pelo identificador da unidade", async () => {
    const result = await listarUnidades({ q: "004" });

    expect(result.total).toBe(1);
    expect(result.items[0]?.codigo).toBe("004");
  });

  it("filtra unidades por status", async () => {
    const result = await listarUnidades({ status: "Inativa" });

    expect(result.total).toBe(9);
    expect(result.items.every((item) => item.status === "Inativa")).toBe(true);
  });

  it("combina busca, status e paginação mantendo as contagens relacionadas", async () => {
    const result = await listarUnidades({
      page: 2,
      size: 2,
      q: "a",
      status: "Ativa",
    });

    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(2);
    expect(result.total).toBeGreaterThan(2);
    expect(result.items).toHaveLength(2);
    expect(result.items.every((item) => item.status === "Ativa")).toBe(true);
    expect(result.items.every((item) => item.totalDocumentos >= 0)).toBe(true);
    expect(result.items.every((item) => item.totalTarefas >= 0)).toBe(true);
  });
});

describe("criarUnidade", () => {
  const values = {
    nome: "Unidade de teste",
    identificador: "NOVO-UNIT",
    cep: "50000000",
    logradouro: "Rua de Teste",
    numero: "S/N",
    complemento: "",
    cidade: "Recife",
    bairro: "Centro",
    uf: "PE" as const,
    descricao: "",
  };

  it("recusa um identificador já usado", async () => {
    await expect(
      criarUnidade({ ...values, identificador: "001" }),
    ).rejects.toBeInstanceOf(IdentificadorUnidadeDuplicadoError);
  });

  it("cria unidade ativa, registra datas e adiciona ao mock compartilhado", async () => {
    const unidade = await criarUnidade(values);

    try {
      expect(unidade.status).toBe("Ativa");
      expect(unidade.codigo).toBe(values.identificador);
      expect(unidade.criadoEm).toEqual(expect.any(String));
      expect(unidade.atualizadoEm).toBe(unidade.criadoEm);
      expect(mockUnidades).toContain(unidade);
      expect(mockHistoricoUnidades).toContainEqual(
        expect.objectContaining({
          unidadeId: unidade.id,
          entidade: "Unidade",
          entidadeId: unidade.id,
          entidadeNome: unidade.nome,
        }),
      );
    } finally {
      const createdIndex = mockUnidades.findIndex(
        (item) => item.id === unidade.id,
      );
      if (createdIndex >= 0) mockUnidades.splice(createdIndex, 1);
      for (let index = mockHistoricoUnidades.length - 1; index >= 0; index -= 1) {
        if (mockHistoricoUnidades[index]?.entidadeId === unidade.id) {
          mockHistoricoUnidades.splice(index, 1);
        }
      }
    }
  });
});


describe("obterUnidade", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("consulta a API e converte os dados para o domínio do frontend", async () => {
    const unidadeApi = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      nome: "Matriz Recife",
      codigo: "MAT-001",
      status: "ativa",
      endereco: {
        cep: "50000000",
        logradouro: "Rua de Teste",
        numero: "100",
        complemento: null,
        bairro: "Centro",
        cidade: "Recife",
        uf: "PE",
      },
      descricao: null,
      criadoEm: "2026-01-10T12:00:00.000Z",
      atualizadoEm: "2026-02-10T12:00:00.000Z",
      totalDocumentos: 12,
      totalTarefas: 8,
    };

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(unidadeApi), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const { obterUnidade } = await import("./unidadesService");
    const resultado = await obterUnidade(unidadeApi.id);

    expect(fetchSpy).toHaveBeenCalledWith(
      `/api/v1/unidades/${unidadeApi.id}`,
      expect.objectContaining({
        method: "GET",
        credentials: "same-origin",
      }),
    );
    expect(resultado).toEqual({
      id: unidadeApi.id,
      nome: "Matriz Recife",
      codigo: "MAT-001",
      status: "Ativa",
      endereco: {
        cep: "50000000",
        logradouro: "Rua de Teste",
        numero: "100",
        complemento: undefined,
        bairro: "Centro",
        cidade: "Recife",
        uf: "PE",
      },
      descricao: undefined,
      criadoEm: "2026-01-10T12:00:00.000Z",
      atualizadoEm: "2026-02-10T12:00:00.000Z",
    });
  });

  it("propaga o erro 404 da API quando a unidade não é encontrada", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          timestamp: "2026-11-23T23:00:00.000Z",
          status: 404,
          error: "Not Found",
          codigo: "RECURSO_NAO_ENCONTRADO",
          message: "Unidade não encontrada.",
          path: "/api/v1/unidades/unidade-inexistente",
          erros: [],
        }),
        {
          status: 404,
          headers: { "content-type": "application/json" },
        },
      ),
    );

    const { obterUnidade } = await import("./unidadesService");

    await expect(obterUnidade("unidade-inexistente")).rejects.toBeInstanceOf(
      ApiError,
    );
  });
});
