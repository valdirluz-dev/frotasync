import { describe, expect, it } from "vitest";

import { atualizarUnidade } from "./unidadesService";
import { atualizarTarefa } from "./tarefasService";
import { mockTarefas, mockUnidades } from "@/mocks/dashboard";

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

  it("mantém status, início e conclusão ao atualizar tarefa", async () => {
    const task = mockTarefas.find((item) => mockUnidades.find((unit) => unit.id === item.unidadeId)?.status === "Ativa")!;
    const original = { status: task.status, dataInicio: task.dataInicio, dataConclusao: task.dataConclusao };
    const updated = await atualizarTarefa(task.id, { titulo: `${task.titulo} atualizada`, unidadeId: task.unidadeId, prazoFinal: task.prazoFinal, descricao: task.descricao ?? "" });
    expect(updated.status).toBe(original.status);
    expect(updated.dataInicio).toBe(original.dataInicio);
    expect(updated.dataConclusao).toBe(original.dataConclusao);
  });
});
