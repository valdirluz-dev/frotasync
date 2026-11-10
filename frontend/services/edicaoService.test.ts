import { describe, expect, it } from "vitest";

import { atualizarUnidade } from "./unidadesService";
import {
  atualizarDocumento,
  criarDocumento,
  excluirDocumento,
  obterDocumento,
} from "./documentosService";
import {
  atualizarTarefa,
  criarTarefa,
  excluirTarefa,
  obterTarefa,
} from "./tarefasService";
import { mockDocumentos } from "@/mocks/documentos";
import { mockTarefas } from "@/mocks/tarefas";
import { mockUnidades } from "@/mocks/unidades";
import { UnidadeInativaError } from "@/lib/errors";

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

  it("cria e remove documento vinculado a unidade ativa", async () => {
    const activeUnit = mockUnidades.find((unit) => unit.status === "Ativa");
    expect(activeUnit).toBeDefined();
    if (!activeUnit) return;

    const documento = await criarDocumento({
      unidadeId: activeUnit.id,
      nome: "Documento criado pelo teste",
      categoria: "Teste",
      dataEmissao: "2026-01-01",
      dataValidade: "2027-01-01",
      descricao: "",
    });

    try {
      expect(await obterDocumento(documento.id)).toEqual(documento);
      await excluirDocumento(documento.id);
      expect(await obterDocumento(documento.id)).toBeNull();
    } finally {
      const index = mockDocumentos.findIndex((item) => item.id === documento.id);
      if (index >= 0) mockDocumentos.splice(index, 1);
    }
  });

  it("cria e remove tarefa vinculada a unidade ativa", async () => {
    const activeUnit = mockUnidades.find((unit) => unit.status === "Ativa");
    expect(activeUnit).toBeDefined();
    if (!activeUnit) return;

    const tarefa = await criarTarefa({
      unidadeId: activeUnit.id,
      titulo: "Tarefa criada pelo teste",
      prazoFinal: "2027-01-01",
      descricao: "",
    });

    try {
      expect(await obterTarefa(tarefa.id)).toEqual(tarefa);
      expect(tarefa.status).toBe("Pendente");
      expect(tarefa.dataConclusao).toBeNull();
      await excluirTarefa(tarefa.id);
      expect(await obterTarefa(tarefa.id)).toBeNull();
    } finally {
      const index = mockTarefas.findIndex((item) => item.id === tarefa.id);
      if (index >= 0) mockTarefas.splice(index, 1);
    }
  });

  it("não altera documento inexistente e retorna erro de recurso padronizado", async () => {
    await expect(
      atualizarDocumento("missing-document", {
        nome: "Documento ausente",
        categoria: "Teste",
        dataEmissao: "2026-01-01",
        dataValidade: "2027-01-01",
        descricao: "",
      }),
    ).rejects.toThrow("Documento não encontrado.");
  });
});
