import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, http } from "@/lib/http";
import { STATUS_COLORS } from "@/lib/statusColors";

import { calcularStatusDocumento } from "@/lib/status";
import { mockDocumentos, mockTarefas, mockUnidades } from "@/mocks/dashboard";
import {
  PerfilSemPermissaoError,
  UnidadeInativaError,
} from "@/lib/errors";
import {
  alterarStatusTarefa,
} from "./tarefasService";
import {
  alterarStatusUnidade,
  obterIndicadoresUnidade,
} from "./unidadesService";
import { getDashboardTasks } from "./dashboardService";

vi.mock("@/lib/http", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/http")>();
  return { ...actual, http: vi.fn() };
});

const httpMock = vi.mocked(http);

afterEach(() => vi.clearAllMocks());

const agora = "2026-11-24T00:00:00.000Z";

function erroApi(status: number, message: string) {
  return new ApiError(status, {
    timestamp: agora,
    status,
    error: "Error",
    message,
    path: "/api/v1/unidades/u-001/status",
    erros: [],
  });
}

describe("serviços de detalhe da unidade", () => {
  it("obtém indicadores da unidade pela API e mapeia os valores", async () => {
    httpMock.mockResolvedValue({
      unidadeId: "u-001",
      totalPendencias: 8,
      documentos: { total: 10, valido: 4, proximoVencimento: 3, expirado: 3 },
      tarefas: { total: 6, pendente: 2, emAndamento: 1, concluida: 3 },
      variacao: {
        referencia: "mes_anterior",
        documentosProximosVencimento: { atual: 3, anterior: 2, percentual: 50 },
        documentosExpirados: { atual: 3, anterior: 1, percentual: 200 },
        tarefasConcluidas: { atual: 3, anterior: 2, percentual: 50 },
      },
    });

    const indicadores = await obterIndicadoresUnidade("u-001");

    expect(httpMock).toHaveBeenCalledWith("/unidades/u-001/indicadores");
    expect(indicadores?.documentos.map((item) => item.value)).toEqual([4, 3, 3]);
    expect(indicadores?.tarefas.map((item) => item.value)).toEqual([3, 1, 2]);
    expect(indicadores?.documentosExpirados).toBe(3);
    expect(indicadores?.tarefasConcluidas).toBe(3);
    expect(indicadores?.variacaoDocumentosExpirados).toBe(200);
    expect(indicadores?.variacaoTarefasConcluidas).toBe(50);
    expect(indicadores?.documentos[0]?.color).toBe(STATUS_COLORS.completed);
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

  it("filtra a listagem de tarefas por unidade", async () => {
    const tasks = await getDashboardTasks({
      page: 1,
      pageSize: 10,
      search: "",
      unidadeId: "u-002",
      status: "Todos",
    });

    expect(tasks.items.length).toBeGreaterThan(0);
    expect(tasks.items.every((item) => item.unidadeId === "u-002")).toBe(true);
  });

  it("altera status da unidade pela API e mapeia o retorno", async () => {
    httpMock.mockResolvedValue({
      id: "u-001",
      nome: "Unidade Recife",
      codigo: "REC-001",
      status: "inativa",
      endereco: {
        cep: "50030230", logradouro: "Rua Teste", numero: "100",
        complemento: "", bairro: "Centro", cidade: "Recife", uf: "PE",
      },
      descricao: "",
      criadoEm: agora,
      atualizadoEm: "2026-11-24T01:00:00.000Z",
      totalDocumentos: 0,
      totalTarefas: 0,
    });

    const updated = await alterarStatusUnidade("u-001", "Inativa", "Administrador");

    expect(httpMock).toHaveBeenCalledWith("/unidades/u-001/status", {
      method: "PATCH",
      body: { status: "inativa" },
    });
    expect(updated.status).toBe("Inativa");
    expect(updated.atualizadoEm).toBe("2026-11-24T01:00:00.000Z");
  });

  it("propaga o HTTP 403 do backend para perfil sem permissão", async () => {
    httpMock.mockRejectedValue(
      erroApi(403, "Somente Administrador pode alterar o status da unidade."),
    );

    await expect(
      alterarStatusUnidade("u-001", "Ativa", "Colaborador"),
    ).rejects.toBeInstanceOf(PerfilSemPermissaoError);

    expect(httpMock).toHaveBeenCalledWith("/unidades/u-001/status", {
      method: "PATCH",
      body: { status: "ativa" },
    });
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
