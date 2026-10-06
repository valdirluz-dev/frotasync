import { describe, expect, it } from "vitest";

import { calcularStatusDocumento } from "../lib/status";
import { mockDocumentos, mockTarefas, mockUnidades } from "../mocks/dashboard";
import {
  alterarStatusTarefa,
  alterarStatusUnidade,
  getDashboardDocuments,
  getDashboardTasks,
  obterIndicadoresUnidade,
  PerfilSemPermissaoError,
  UnidadeInativaError,
} from "./dashboardService";

describe("serviços de detalhe da unidade", () => {
  it("obtém indicadores calculados apenas com os dados da unidade", async () => {
    const unitId = "u-001";
    const indicadores = await obterIndicadoresUnidade(unitId);
    const documents = mockDocumentos.filter(
      (item) => item.unidadeId === unitId,
    );
    const tasks = mockTarefas.filter((item) => item.unidadeId === unitId);

    expect(indicadores).not.toBeNull();
    expect(
      indicadores?.documentos.reduce((sum, item) => sum + item.value, 0),
    ).toBe(documents.length);
    expect(
      indicadores?.tarefas.reduce((sum, item) => sum + item.value, 0),
    ).toBe(tasks.length);
    expect(indicadores?.documentosExpirados).toBe(
      documents.filter(
        (item) => calcularStatusDocumento(item.dataValidade) === "Expirado",
      ).length,
    );
    expect(indicadores?.tarefasConcluidas).toBe(
      tasks.filter((item) => item.status === "Concluída").length,
    );
  });

  it("mantém dados e três status variados inclusive nas unidades inativas", () => {
    for (const unit of mockUnidades) {
      const documents = mockDocumentos.filter(
        (item) => item.unidadeId === unit.id,
      );
      const tasks = mockTarefas.filter((item) => item.unidadeId === unit.id);
      const documentStatuses = new Set(
        documents.map((item) => calcularStatusDocumento(item.dataValidade)),
      );
      const taskStatuses = new Set(tasks.map((item) => item.status));

      expect(documents.length).toBeGreaterThanOrEqual(3);
      expect(tasks.length).toBeGreaterThanOrEqual(3);
      expect(documentStatuses.size).toBe(3);
      expect(taskStatuses.size).toBe(3);
      expect(unit.criadoEm).toEqual(expect.any(String));
      expect(unit.atualizadoEm).toEqual(expect.any(String));
    }
  });

  it("filtra as listagens de documentos e tarefas por unidade", async () => {
    const unitId = "u-002";
    const common = {
      page: 1,
      pageSize: 10,
      search: "",
      unidadeId: unitId,
      status: "Todos" as const,
    };
    const documents = await getDashboardDocuments({
      ...common,
      categoria: "todas",
    });
    const tasks = await getDashboardTasks(common);

    expect(documents.items.length).toBeGreaterThan(0);
    expect(documents.items.every((item) => item.unidadeId === unitId)).toBe(
      true,
    );
    expect(tasks.items.length).toBeGreaterThan(0);
    expect(tasks.items.every((item) => item.unidadeId === unitId)).toBe(true);
  });

  it("altera status da unidade e atualiza a última modificação", async () => {
    const unitIndex = mockUnidades.findIndex((item) => item.id === "u-001");
    const original = mockUnidades[unitIndex];

    try {
      const updated = await alterarStatusUnidade(original.id, "Ativa");
      expect(updated.status).toBe("Ativa");
      expect(updated.atualizadoEm).not.toBe(original.atualizadoEm);
      expect(mockUnidades[unitIndex].status).toBe("Ativa");
    } finally {
      mockUnidades[unitIndex] = original;
    }
  });

  it("recusa alteração de status da unidade para perfil não administrador", async () => {
    await expect(
      alterarStatusUnidade("u-001", "Ativa", "Colaborador"),
    ).rejects.toBeInstanceOf(PerfilSemPermissaoError);
  });

  it("registra a conclusão e limpa dataConclusao ao reabrir a tarefa", async () => {
    const taskIndex = mockTarefas.findIndex(
      (item) => item.unidadeId === "u-002",
    );
    const unitIndex = mockUnidades.findIndex((item) => item.id === "u-002");
    const originalTask = mockTarefas[taskIndex];
    const originalUnit = mockUnidades[unitIndex];

    try {
      const completed = await alterarStatusTarefa(originalTask.id, "Concluída");
      expect(completed.status).toBe("Concluída");
      expect(completed.dataConclusao).toEqual(expect.any(String));
      expect(Number.isNaN(Date.parse(completed.dataConclusao ?? ""))).toBe(
        false,
      );

      const reopened = await alterarStatusTarefa(
        originalTask.id,
        "Em andamento",
      );
      expect(reopened.status).toBe("Em andamento");
      expect(reopened.dataConclusao).toBeNull();
    } finally {
      mockTarefas[taskIndex] = originalTask;
      mockUnidades[unitIndex] = originalUnit;
    }
  });

  it("recusa alteração de status de tarefa em unidade inativa", async () => {
    const inactiveTask = mockTarefas.find((item) => item.unidadeId === "u-001");
    expect(inactiveTask).toBeDefined();
    if (!inactiveTask) return;

    await expect(
      alterarStatusTarefa(inactiveTask.id, "Concluída"),
    ).rejects.toBeInstanceOf(UnidadeInativaError);
  });
});
