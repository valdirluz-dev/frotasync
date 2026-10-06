import { describe, expect, it } from "vitest";

import { atualizarUnidade } from "./unidadesService";
import { atualizarDocumento } from "./documentosService";
import { atualizarTarefa } from "./tarefasService";
import { mockDocumentos, mockTarefas, mockUnidades } from "../mocks/dashboard";
import { UnidadeInativaError } from "./dashboardService";

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
  it("atualiza unidade ignorando seu próprio identificador e preserva status", async () => {
    const original = mockUnidades[1];
    const before = original.atualizadoEm;
    const updated = await atualizarUnidade(original.id, { ...unidadeValues(original), nome: "Caruaru Atualizada" });
    expect(updated.status).toBe(original.status);
    expect(updated.nome).toBe("Caruaru Atualizada");
    expect(updated.atualizadoEm).not.toBe(before);
  });

  it("recusa identificador duplicado de outra unidade", async () => {
    const original = mockUnidades[1];
    await expect(atualizarUnidade(original.id, { ...unidadeValues(original), identificador: mockUnidades[2].codigo })).rejects.toThrow("Já existe uma unidade");
  });

  it("recusa documento de unidade inativa e mantém anexo sem novo arquivo", async () => {
    const document = mockDocumentos.find((item) => mockUnidades.find((unit) => unit.id === item.unidadeId)?.status === "Inativa")!;
    const originalAttachment = document.anexo;
    await expect(atualizarDocumento(document.id, {
      nome: document.nome,
      categoria: document.categoria,
      dataEmissao: document.dataEmissao ?? "2025-01-01",
      dataValidade: document.dataValidade,
      descricao: document.descricao ?? "",
    })).rejects.toBeInstanceOf(UnidadeInativaError);
    expect(document.anexo).toEqual(originalAttachment);
  });

  it("mantém status, início e conclusão ao atualizar tarefa", async () => {
    const task = mockTarefas.find((item) => mockUnidades.find((unit) => unit.id === item.unidadeId)?.status === "Ativa")!;
    const original = { status: task.status, dataInicio: task.dataInicio, dataConclusao: task.dataConclusao };
    const updated = await atualizarTarefa(task.id, { titulo: `${task.titulo} atualizada`, prazoFinal: task.prazoFinal, descricao: task.descricao ?? "" });
    expect(updated.status).toBe(original.status);
    expect(updated.dataInicio).toBe(original.dataInicio);
    expect(updated.dataConclusao).toBe(original.dataConclusao);
  });
});
