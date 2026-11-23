import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardService } from './dashboard.service';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';

const empresaId = 'c3c4a4b7-14ba-4204-a341-7896853621b4';
const unidadeId = 'd9428888-122b-4b42-9acc-2a83c47b3f6e';

interface ResultadoGlobal {
  total_unidades: number;
  unidades_ativas: number;
  unidades_inativas: number;
  total_documentos: number;
  documentos_validos: number;
  documentos_proximos: number;
  documentos_expirados: number;
  total_tarefas: number;
  tarefas_pendentes: number;
  tarefas_em_andamento: number;
  tarefas_concluidas: number;
  documentos_proximos_anterior: number;
  documentos_expirados_anterior: number;
  tarefas_concluidas_anterior: number;
}

interface ResultadoUnidade {
  total_documentos: number;
  documentos_validos: number;
  documentos_proximos: number;
  documentos_expirados: number;
  total_tarefas: number;
  tarefas_pendentes: number;
  tarefas_em_andamento: number;
  tarefas_concluidas: number;
  documentos_proximos_anterior: number;
  documentos_expirados_anterior: number;
  tarefas_concluidas_anterior: number;
}

function resultadoGlobal(
  overrides: Partial<ResultadoGlobal> = {},
): ResultadoGlobal {
  return {
    total_unidades: 0,
    unidades_ativas: 0,
    unidades_inativas: 0,
    total_documentos: 0,
    documentos_validos: 0,
    documentos_proximos: 0,
    documentos_expirados: 0,
    total_tarefas: 0,
    tarefas_pendentes: 0,
    tarefas_em_andamento: 0,
    tarefas_concluidas: 0,
    documentos_proximos_anterior: 0,
    documentos_expirados_anterior: 0,
    tarefas_concluidas_anterior: 0,
    ...overrides,
  };
}

function resultadoUnidade(
  overrides: Partial<ResultadoUnidade> = {},
): ResultadoUnidade {
  return {
    total_documentos: 0,
    documentos_validos: 0,
    documentos_proximos: 0,
    documentos_expirados: 0,
    total_tarefas: 0,
    tarefas_pendentes: 0,
    tarefas_em_andamento: 0,
    tarefas_concluidas: 0,
    documentos_proximos_anterior: 0,
    documentos_expirados_anterior: 0,
    tarefas_concluidas_anterior: 0,
    ...overrides,
  };
}

const prismaMock = {
  $queryRaw: jest.fn<(query: unknown) => Promise<unknown[]>>(),
  unidade: {
    findFirst: jest.fn<(args: unknown) => Promise<{ id: string } | null>>(),
  },
};

let service: DashboardService;

describe('DashboardService', () => {
  beforeEach(() => {
    prismaMock.$queryRaw.mockReset();
    prismaMock.unidade.findFirst.mockReset();

    service = new DashboardService(prismaMock as unknown as PrismaService);
  });

  it('retorna indicadores zerados quando não existem registros', async () => {
    prismaMock.$queryRaw.mockResolvedValue([resultadoGlobal()]);

    const resultado = await service.obterIndicadores(empresaId);

    expect(resultado).toMatchObject({
      totalUnidades: 0,
      totalDocumentos: 0,
      totalTarefasPendentes: 0,
      totalPendencias: 0,
      unidades: { ativas: 0, inativas: 0 },
      documentos: {
        valido: 0,
        proximoVencimento: 0,
        expirado: 0,
      },
      tarefas: {
        pendente: 0,
        emAndamento: 0,
        concluida: 0,
      },
    });

    expect(
      resultado.variacao.documentosProximosVencimento.percentual,
    ).toBeNull();
    expect(resultado.variacao.documentosExpirados.percentual).toBeNull();
    expect(resultado.variacao.tarefasConcluidas.percentual).toBeNull();
  });

  it('calcula pendências e variações com uma casa decimal', async () => {
    prismaMock.$queryRaw.mockResolvedValue([
      resultadoGlobal({
        total_unidades: 3,
        unidades_ativas: 2,
        unidades_inativas: 1,
        total_documentos: 10,
        documentos_validos: 4,
        documentos_proximos: 5,
        documentos_expirados: 1,
        total_tarefas: 12,
        tarefas_pendentes: 2,
        tarefas_em_andamento: 3,
        tarefas_concluidas: 7,
        documentos_proximos_anterior: 4,
        documentos_expirados_anterior: 0,
        tarefas_concluidas_anterior: 17,
      }),
    ]);

    const resultado = await service.obterIndicadores(empresaId);

    expect(resultado.totalPendencias).toBe(11);
    expect(resultado.totalTarefasPendentes).toBe(2);

    expect(resultado.variacao.documentosProximosVencimento).toEqual({
      atual: 5,
      anterior: 4,
      percentual: 25,
    });

    expect(resultado.variacao.documentosExpirados).toEqual({
      atual: 1,
      anterior: 0,
      percentual: null,
    });

    expect(resultado.variacao.tarefasConcluidas).toEqual({
      atual: 7,
      anterior: 17,
      percentual: -58.8,
    });
  });

  it('não consulta indicadores de unidade inexistente ou de outra empresa', async () => {
    prismaMock.unidade.findFirst.mockResolvedValue(null);

    await expect(
      service.obterIndicadoresUnidade(unidadeId, empresaId),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prismaMock.unidade.findFirst).toHaveBeenCalledWith({
      where: {
        id: unidadeId,
        empresa_id: empresaId,
      },
      select: { id: true },
    });

    expect(prismaMock.$queryRaw).not.toHaveBeenCalled();
  });

  it('retorna indicadores da unidade e calcula suas pendências', async () => {
    prismaMock.unidade.findFirst.mockResolvedValue({ id: unidadeId });
    prismaMock.$queryRaw.mockResolvedValue([
      resultadoUnidade({
        total_documentos: 8,
        documentos_validos: 6,
        documentos_proximos: 1,
        documentos_expirados: 1,
        total_tarefas: 8,
        tarefas_pendentes: 2,
        tarefas_em_andamento: 1,
        tarefas_concluidas: 5,
        documentos_proximos_anterior: 1,
        documentos_expirados_anterior: 2,
        tarefas_concluidas_anterior: 4,
      }),
    ]);

    const resultado = await service.obterIndicadoresUnidade(
      unidadeId,
      empresaId,
    );

    expect(resultado).toMatchObject({
      unidadeId,
      totalPendencias: 5,
      documentos: {
        total: 8,
        valido: 6,
        proximoVencimento: 1,
        expirado: 1,
      },
      tarefas: {
        total: 8,
        pendente: 2,
        emAndamento: 1,
        concluida: 5,
      },
      variacao: {
        referencia: 'mes_anterior',
        documentosProximosVencimento: {
          atual: 1,
          anterior: 1,
          percentual: 0,
        },
        documentosExpirados: {
          atual: 1,
          anterior: 2,
          percentual: -50,
        },
        tarefasConcluidas: {
          atual: 5,
          anterior: 4,
          percentual: 25,
        },
      },
    });
  });
});
