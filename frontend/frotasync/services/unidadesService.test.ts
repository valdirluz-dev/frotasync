import { describe, expect, it } from "vitest";

import { mockUnidades } from "../mocks/dashboard";
import {
  criarUnidade,
  IdentificadorUnidadeDuplicadoError,
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
    } finally {
      const createdIndex = mockUnidades.findIndex(
        (item) => item.id === unidade.id,
      );
      if (createdIndex >= 0) mockUnidades.splice(createdIndex, 1);
    }
  });
});
