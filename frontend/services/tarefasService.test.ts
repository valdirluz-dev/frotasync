import { afterEach, describe, expect, it } from "vitest";

import { mockTarefas, mockUnidades } from "@/mocks/dashboard";
import { mockHistoricoUnidades } from "@/mocks/historicoUnidades";
import { mockNovaTarefa } from "@/mocks/tarefas";
import {
  RecursoNaoEncontradoError,
  UnidadeInativaError,
} from "@/lib/errors";
import { criarTarefa, obterTarefa } from "./tarefasService";

const createdIds: string[] = [];

afterEach(() => {
  const ids = createdIds.splice(0);
  for (const id of ids) {
    const index = mockTarefas.findIndex((tarefa) => tarefa.id === id);
    if (index >= 0) mockTarefas.splice(index, 1);
  }
  for (let index = mockHistoricoUnidades.length - 1; index >= 0; index -= 1) {
    if (ids.includes(mockHistoricoUnidades[index]!.entidadeId)) {
      mockHistoricoUnidades.splice(index, 1);
    }
  }
});

describe("criarTarefa", () => {
  it("cria tarefa pendente, com data de início automática, e atualiza o mock", async () => {
    const unidadeAtiva = mockUnidades.find(
      (unidade) => unidade.status === "Ativa",
    );
    expect(unidadeAtiva).toBeDefined();

    const tarefa = await criarTarefa({
      ...mockNovaTarefa,
      unidadeId: unidadeAtiva!.id,
    });
    createdIds.push(tarefa.id);

    expect(tarefa).toMatchObject({
      titulo: mockNovaTarefa.titulo,
      unidadeId: unidadeAtiva!.id,
      prazoFinal: mockNovaTarefa.prazoFinal,
      status: "Pendente",
      dataConclusao: null,
    });
    expect(tarefa.dataInicio).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(mockTarefas).toContain(tarefa);
    expect(mockHistoricoUnidades).toContainEqual(
      expect.objectContaining({
        unidadeId: tarefa.unidadeId,
        entidade: "Tarefa",
        entidadeId: tarefa.id,
        entidadeNome: tarefa.titulo,
      }),
    );
  });

  it("não cria tarefa em unidade inativa", async () => {
    const unidadeInativa = mockUnidades.find(
      (unidade) => unidade.status === "Inativa",
    );
    expect(unidadeInativa).toBeDefined();

    await expect(
      criarTarefa({ ...mockNovaTarefa, unidadeId: unidadeInativa!.id }),
    ).rejects.toBeInstanceOf(UnidadeInativaError);
  });

  it("retorna erro se a unidade não existe", async () => {
    await expect(
      criarTarefa({ ...mockNovaTarefa, unidadeId: "unidade-inexistente" }),
    ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
  });

  it("permite consultar tarefa recém-criada pelo id", async () => {
    const tarefa = await criarTarefa(mockNovaTarefa);
    createdIds.push(tarefa.id);

    await expect(obterTarefa(tarefa.id)).resolves.toEqual(tarefa);
  });
});
