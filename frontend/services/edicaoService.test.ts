import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, http } from "@/lib/http";
import { IdentificadorUnidadeDuplicadoError } from "@/lib/errors";

import { atualizarUnidade } from "./unidadesService";
import { atualizarTarefa } from "./tarefasService";
import { mockTarefas, mockUnidades } from "@/mocks/dashboard";

vi.mock("@/lib/http", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/http")>();
  return { ...actual, http: vi.fn() };
});

const httpMock = vi.mocked(http);

afterEach(() => vi.clearAllMocks());

const agora = "2026-11-24T00:00:00.000Z";

const unidadeApi = {
  id: "u-002",
  nome: "Caruaru Atualizada",
  codigo: "CAR-002",
  status: "inativa" as const,
  endereco: {
    cep: "50000000",
    logradouro: "Rua de Teste",
    numero: "10",
    complemento: "",
    bairro: "Centro",
    cidade: "Caruaru",
    uf: "PE",
  },
  descricao: "",
  criadoEm: agora,
  atualizadoEm: "2026-11-24T01:00:00.000Z",
  totalDocumentos: 0,
  totalTarefas: 0,
};

function erroDuplicado() {
  return new ApiError(409, {
    timestamp: agora,
    status: 409,
    error: "Conflict",
    codigo: "IDENTIFICADOR_DUPLICADO",
    message: "Já existe uma unidade com este identificador",
    path: "/api/v1/unidades/u-002",
    erros: [],
  });
}

const unidadeValues = (unidade: (typeof mockUnidades)[number]) => ({
  nome: unidade.nome,
  identificador: unidade.codigo,
  cep: unidade.endereco.cep ?? "50000000",
  logradouro: unidade.endereco.logradouro,
  numero: unidade.endereco.numero,
  complemento: unidade.endereco.complemento ?? "",
  bairro: unidade.endereco.bairro,
  cidade: unidade.endereco.cidade,
  uf: unidade.endereco.uf,
  descricao: unidade.descricao ?? "",
});

describe("edição", () => {
  it("atualiza unidade pela API e preserva status retornado pelo backend", async () => {
    const original = mockUnidades[1];
    httpMock.mockResolvedValue(unidadeApi);

    const updated = await atualizarUnidade(original.id, {
      ...unidadeValues(original),
      nome: "Caruaru Atualizada",
    });

    expect(httpMock).toHaveBeenCalledWith("/unidades/u-002", {
      method: "PUT",
      body: expect.objectContaining({
        nome: "Caruaru Atualizada",
        codigo: original.codigo,
        cep: "50000000",
      }),
    });
    expect(updated.status).toBe("Inativa");
    expect(updated.nome).toBe("Caruaru Atualizada");
    expect(updated.atualizadoEm).toBe("2026-11-24T01:00:00.000Z");
  });

  it("converte HTTP 409 de identificador duplicado em erro de domínio", async () => {
    const original = mockUnidades[1];
    httpMock.mockRejectedValue(erroDuplicado());

    await expect(
      atualizarUnidade(original.id, {
        ...unidadeValues(original),
        identificador: mockUnidades[2].codigo,
      }),
    ).rejects.toBeInstanceOf(IdentificadorUnidadeDuplicadoError);

    expect(httpMock).toHaveBeenCalledWith(
      "/unidades/u-002",
      expect.objectContaining({ method: "PUT" }),
    );
  });

  it("mantém status, início e conclusão ao atualizar tarefa", async () => {
    const task = mockTarefas.find((item) => mockUnidades.find((unit) => unit.id === item.unidadeId)?.status === "Ativa")!;
    const original = { status: task.status, dataInicio: task.dataInicio, dataConclusao: task.dataConclusao };
    const updated = await atualizarTarefa(task.id, { titulo: `${task.titulo} atualizada`, unidadeId: task.unidadeId, prazoFinal: task.prazoFinal, descricao: task.descricao ?? "" });
    expect(updated.status).toBe(original.status);
    expect(updated.dataInicio).toBe(original.dataInicio);
    expect(updated.dataConclusao).toBe(original.dataConclusao);
  });
});
