import { afterEach, describe, expect, it } from "vitest";

import { mockHistoricoUnidades } from "@/mocks/historicoUnidades";
import { usuarioLogadoAtual } from "@/mocks/authStore";
import { mockTarefas, mockUnidades } from "@/mocks/dashboard";
import { mockNovaTarefa } from "@/mocks/tarefas";
import { RecursoNaoEncontradoError } from "@/lib/errors";
import {
  listarHistoricoGlobal,
  listarHistoricoUnidade,
  registrarEventoHistoricoUnidade,
} from "./historicoUnidadesService";
import { criarTarefa, atualizarTarefa, alterarStatusTarefa } from "./tarefasService";

const createdIds: string[] = [];

afterEach(() => {
  for (let index = mockHistoricoUnidades.length - 1; index >= 0; index -= 1) {
    if (createdIds.includes(mockHistoricoUnidades[index]!.id)) {
      mockHistoricoUnidades.splice(index, 1);
    }
  }
  createdIds.length = 0;
});

describe("historicoUnidadesService", () => {
  it("registra usuário e data/hora no mock após uma alteração", () => {
    registrarEventoHistoricoUnidade({
      unidadeId: "u-historico",
      acao: "Atualizou a unidade",
      entidade: "Unidade",
      entidadeId: "u-historico",
      entidadeNome: "Unidade de teste",
    });
    const evento = mockHistoricoUnidades.at(-1)!;
    createdIds.push(evento.id);

    expect(evento).toMatchObject({
      unidadeId: "u-historico",
      usuario: usuarioLogadoAtual.nome,
      acao: "Atualizou a unidade",
      entidade: "Unidade",
      entidadeId: "u-historico",
      entidadeNome: "Unidade de teste",
    });
    expect(new Date(evento.criadoEm).toISOString()).toBe(evento.criadoEm);
  });

  it("filtra por unidade, ordena do mais recente ao mais antigo e pagina resultados", async () => {
    const eventos = [
      { entidadeNome: "Mais antigo", criadoEm: "2025-01-01T10:00:00.000Z" },
      { entidadeNome: "Mais recente", criadoEm: "2025-01-03T10:00:00.000Z" },
      { entidadeNome: "Intermediário", criadoEm: "2025-01-02T10:00:00.000Z" },
    ];
    for (const evento of eventos) {
      registrarEventoHistoricoUnidade({
        unidadeId: "u-paginacao",
        acao: "Atualizou a unidade",
        entidade: "Unidade",
        entidadeId: "u-paginacao",
        entidadeNome: evento.entidadeNome,
      });
      const saved = mockHistoricoUnidades.at(-1)!;
      saved.criadoEm = evento.criadoEm;
      createdIds.push(saved.id);
    }
    registrarEventoHistoricoUnidade({
      unidadeId: "u-outra",
      acao: "Atualizou a unidade",
      entidade: "Unidade",
      entidadeId: "u-outra",
      entidadeNome: "Outra unidade",
    });
    createdIds.push(mockHistoricoUnidades.at(-1)!.id);

    const firstPage = await listarHistoricoUnidade("u-paginacao", 1, 2);
    const secondPage = await listarHistoricoUnidade("u-paginacao", 2, 2);

    expect(firstPage).toMatchObject({
      page: 1,
      pageSize: 2,
      total: 3,
      totalPages: 2,
    });
    expect(firstPage.items.map((item) => item.entidadeNome)).toEqual([
      "Mais recente",
      "Intermediário",
    ]);
    expect(secondPage.items.map((item) => item.entidadeNome)).toEqual([
      "Mais antigo",
    ]);
  });

  it("filtra o histórico global por texto, unidade e entidade", async () => {
    for (const evento of [
      {
        unidadeId: "u-global-a",
        acao: "Cadastrou o documento",
        entidade: "Documento" as const,
        entidadeNome: "Licença Ambiental",
      },
      {
        unidadeId: "u-global-b",
        acao: "Cadastrou a tarefa",
        entidade: "Tarefa" as const,
        entidadeNome: "Revisão de frota",
      },
    ]) {
      registrarEventoHistoricoUnidade({
        ...evento,
        entidadeId: evento.unidadeId,
      });
      createdIds.push(mockHistoricoUnidades.at(-1)!.id);
    }

    const result = await listarHistoricoGlobal({
      page: 1,
      pageSize: 10,
      search: "licenca",
      unidadeId: "u-global-a",
      entidade: "Documento",
    });

    expect(result.total).toBe(1);
    expect(result.items[0]?.entidadeNome).toBe("Licença Ambiental");
  });

  it("registra criação, atualização e alteração de status de tarefa", async () => {
    const unidade = mockUnidades.find((item) => item.status === "Ativa");
    expect(unidade).toBeDefined();
    if (!unidade) return;

    const tarefaIdsAntes = new Set(mockTarefas.map((item) => item.id));

    try {
      const tarefa = await criarTarefa({
        ...mockNovaTarefa,
        unidadeId: unidade.id,
      });
      createdIds.push(
        ...mockHistoricoUnidades
          .filter((evento) => evento.unidadeId === unidade.id)
          .map((evento) => evento.id),
      );

      await atualizarTarefa(tarefa.id, {
        ...mockNovaTarefa,
        unidadeId: unidade.id,
        titulo: "Tarefa atualizada",
      });
      await alterarStatusTarefa(tarefa.id, "Em andamento");

      const events = mockHistoricoUnidades.filter(
        (evento) =>
          evento.unidadeId === unidade.id &&
          evento.entidade === "Tarefa" &&
          evento.entidadeId === tarefa.id,
      );

      expect(events.map((evento) => evento.acao)).toEqual([
        "Cadastrou a tarefa",
        "Atualizou a tarefa",
        "Alterou o status da tarefa de Pendente para Em andamento",
      ]);
      expect(events.every((evento) => evento.usuario === usuarioLogadoAtual.nome)).toBe(true);

      await expect(
        criarTarefa({ ...mockNovaTarefa, unidadeId: "unidade-inexistente" }),
      ).rejects.toBeInstanceOf(RecursoNaoEncontradoError);
      expect(
        mockHistoricoUnidades.filter(
          (evento) => evento.unidadeId === unidade.id && evento.entidadeId === tarefa.id,
        ),
      ).toHaveLength(3);
    } finally {
      for (let index = mockTarefas.length - 1; index >= 0; index -= 1) {
        if (!tarefaIdsAntes.has(mockTarefas[index]!.id)) {
          mockTarefas.splice(index, 1);
        }
      }
    }
  });
});
