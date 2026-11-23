import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface ResultadoIndicadores {
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

type ResultadoIndicadoresUnidade = Omit<
  ResultadoIndicadores,
  'total_unidades' | 'unidades_ativas' | 'unidades_inativas'
>;

export interface Variacao {
  atual: number;
  anterior: number;
  percentual: number | null;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private calcularVariacao(atual: number, anterior: number): Variacao {
    return {
      atual,
      anterior,
      percentual:
        anterior === 0
          ? null
          : Number((((atual - anterior) / anterior) * 100).toFixed(1)),
    };
  }

  private calcularPendencias(
    documentosProximos: number,
    documentosExpirados: number,
    tarefasPendentes: number,
    tarefasEmAndamento: number,
  ): number {
    return (
      documentosProximos +
      documentosExpirados +
      tarefasPendentes +
      tarefasEmAndamento
    );
  }

  async obterIndicadores(empresaId: string) {
    const [resultado] = await this.prisma.$queryRaw<
      ResultadoIndicadores[]
    >(Prisma.sql`
      WITH referencia AS (
        SELECT
          (CURRENT_TIMESTAMP AT TIME ZONE 'America/Recife')::date AS atual,
          (
            (CURRENT_TIMESTAMP AT TIME ZONE 'America/Recife')::date
            - INTERVAL '1 month'
          )::date AS anterior
      )
      SELECT
        (
          SELECT COUNT(*)::int
          FROM unidade u
          WHERE u.empresa_id = ${empresaId}::uuid
        ) AS total_unidades,

        (
          SELECT COUNT(*)::int
          FROM unidade u
          WHERE u.empresa_id = ${empresaId}::uuid
            AND u.status = 'ativa'
        ) AS unidades_ativas,

        (
          SELECT COUNT(*)::int
          FROM unidade u
          WHERE u.empresa_id = ${empresaId}::uuid
            AND u.status = 'inativa'
        ) AS unidades_inativas,

        (
          SELECT COUNT(*)::int
          FROM documento d
          INNER JOIN unidade u ON u.id = d.unidade_id
          WHERE u.empresa_id = ${empresaId}::uuid
        ) AS total_documentos,

        (
          SELECT COUNT(*)::int
          FROM documento d
          INNER JOIN unidade u ON u.id = d.unidade_id
          CROSS JOIN referencia r
          WHERE u.empresa_id = ${empresaId}::uuid
            AND d.data_validade > r.atual + 15
        ) AS documentos_validos,

        (
          SELECT COUNT(*)::int
          FROM documento d
          INNER JOIN unidade u ON u.id = d.unidade_id
          CROSS JOIN referencia r
          WHERE u.empresa_id = ${empresaId}::uuid
            AND d.data_validade >= r.atual
            AND d.data_validade <= r.atual + 15
        ) AS documentos_proximos,

        (
          SELECT COUNT(*)::int
          FROM documento d
          INNER JOIN unidade u ON u.id = d.unidade_id
          CROSS JOIN referencia r
          WHERE u.empresa_id = ${empresaId}::uuid
            AND d.data_validade < r.atual
        ) AS documentos_expirados,

        (
          SELECT COUNT(*)::int
          FROM tarefa t
          INNER JOIN unidade u ON u.id = t.unidade_id
          WHERE u.empresa_id = ${empresaId}::uuid
        ) AS total_tarefas,

        (
          SELECT COUNT(*)::int
          FROM tarefa t
          INNER JOIN unidade u ON u.id = t.unidade_id
          WHERE u.empresa_id = ${empresaId}::uuid
            AND t.status = 'pendente'
        ) AS tarefas_pendentes,

        (
          SELECT COUNT(*)::int
          FROM tarefa t
          INNER JOIN unidade u ON u.id = t.unidade_id
          WHERE u.empresa_id = ${empresaId}::uuid
            AND t.status = 'em_andamento'
        ) AS tarefas_em_andamento,

        (
          SELECT COUNT(*)::int
          FROM tarefa t
          INNER JOIN unidade u ON u.id = t.unidade_id
          WHERE u.empresa_id = ${empresaId}::uuid
            AND t.status = 'concluida'
        ) AS tarefas_concluidas,

        (
          SELECT COUNT(*)::int
          FROM documento d
          INNER JOIN unidade u ON u.id = d.unidade_id
          CROSS JOIN referencia r
          WHERE u.empresa_id = ${empresaId}::uuid
            AND d.data_validade >= r.anterior
            AND d.data_validade <= r.anterior + 15
        ) AS documentos_proximos_anterior,

        (
          SELECT COUNT(*)::int
          FROM documento d
          INNER JOIN unidade u ON u.id = d.unidade_id
          CROSS JOIN referencia r
          WHERE u.empresa_id = ${empresaId}::uuid
            AND d.data_validade < r.anterior
        ) AS documentos_expirados_anterior,

        (
          SELECT COUNT(*)::int
          FROM tarefa t
          INNER JOIN unidade u ON u.id = t.unidade_id
          CROSS JOIN referencia r
          WHERE u.empresa_id = ${empresaId}::uuid
            AND t.status = 'concluida'
            AND t.data_conclusao <
              ((r.anterior + 1)::timestamp AT TIME ZONE 'America/Recife')
        ) AS tarefas_concluidas_anterior
    `);

    return {
      totalUnidades: resultado.total_unidades,
      totalDocumentos: resultado.total_documentos,
      totalTarefasPendentes: resultado.tarefas_pendentes,
      totalPendencias: this.calcularPendencias(
        resultado.documentos_proximos,
        resultado.documentos_expirados,
        resultado.tarefas_pendentes,
        resultado.tarefas_em_andamento,
      ),
      unidades: {
        ativas: resultado.unidades_ativas,
        inativas: resultado.unidades_inativas,
      },
      documentos: {
        valido: resultado.documentos_validos,
        proximoVencimento: resultado.documentos_proximos,
        expirado: resultado.documentos_expirados,
      },
      tarefas: {
        pendente: resultado.tarefas_pendentes,
        emAndamento: resultado.tarefas_em_andamento,
        concluida: resultado.tarefas_concluidas,
      },
      variacao: {
        referencia: 'mes_anterior' as const,
        documentosProximosVencimento: this.calcularVariacao(
          resultado.documentos_proximos,
          resultado.documentos_proximos_anterior,
        ),
        documentosExpirados: this.calcularVariacao(
          resultado.documentos_expirados,
          resultado.documentos_expirados_anterior,
        ),
        tarefasConcluidas: this.calcularVariacao(
          resultado.tarefas_concluidas,
          resultado.tarefas_concluidas_anterior,
        ),
      },
    };
  }

  async obterIndicadoresUnidade(unidadeId: string, empresaId: string) {
    const unidade = await this.prisma.unidade.findFirst({
      where: {
        id: unidadeId,
        empresa_id: empresaId,
      },
      select: { id: true },
    });

    if (!unidade) {
      throw new NotFoundException({
        message: 'Unidade não encontrada.',
        codigo: 'RECURSO_NAO_ENCONTRADO',
      });
    }

    const [resultado] = await this.prisma.$queryRaw<
      ResultadoIndicadoresUnidade[]
    >(Prisma.sql`
      WITH referencia AS (
        SELECT
          (CURRENT_TIMESTAMP AT TIME ZONE 'America/Recife')::date AS atual,
          (
            (CURRENT_TIMESTAMP AT TIME ZONE 'America/Recife')::date
            - INTERVAL '1 month'
          )::date AS anterior
      )
      SELECT
        (
          SELECT COUNT(*)::int
          FROM documento d
          WHERE d.unidade_id = ${unidadeId}::uuid
        ) AS total_documentos,

        (
          SELECT COUNT(*)::int
          FROM documento d
          CROSS JOIN referencia r
          WHERE d.unidade_id = ${unidadeId}::uuid
            AND d.data_validade > r.atual + 15
        ) AS documentos_validos,

        (
          SELECT COUNT(*)::int
          FROM documento d
          CROSS JOIN referencia r
          WHERE d.unidade_id = ${unidadeId}::uuid
            AND d.data_validade >= r.atual
            AND d.data_validade <= r.atual + 15
        ) AS documentos_proximos,

        (
          SELECT COUNT(*)::int
          FROM documento d
          CROSS JOIN referencia r
          WHERE d.unidade_id = ${unidadeId}::uuid
            AND d.data_validade < r.atual
        ) AS documentos_expirados,

        (
          SELECT COUNT(*)::int
          FROM tarefa t
          WHERE t.unidade_id = ${unidadeId}::uuid
        ) AS total_tarefas,

        (
          SELECT COUNT(*)::int
          FROM tarefa t
          WHERE t.unidade_id = ${unidadeId}::uuid
            AND t.status = 'pendente'
        ) AS tarefas_pendentes,

        (
          SELECT COUNT(*)::int
          FROM tarefa t
          WHERE t.unidade_id = ${unidadeId}::uuid
            AND t.status = 'em_andamento'
        ) AS tarefas_em_andamento,

        (
          SELECT COUNT(*)::int
          FROM tarefa t
          WHERE t.unidade_id = ${unidadeId}::uuid
            AND t.status = 'concluida'
        ) AS tarefas_concluidas,

        (
          SELECT COUNT(*)::int
          FROM documento d
          CROSS JOIN referencia r
          WHERE d.unidade_id = ${unidadeId}::uuid
            AND d.data_validade >= r.anterior
            AND d.data_validade <= r.anterior + 15
        ) AS documentos_proximos_anterior,

        (
          SELECT COUNT(*)::int
          FROM documento d
          CROSS JOIN referencia r
          WHERE d.unidade_id = ${unidadeId}::uuid
            AND d.data_validade < r.anterior
        ) AS documentos_expirados_anterior,

        (
          SELECT COUNT(*)::int
          FROM tarefa t
          CROSS JOIN referencia r
          WHERE t.unidade_id = ${unidadeId}::uuid
            AND t.status = 'concluida'
            AND t.data_conclusao <
              ((r.anterior + 1)::timestamp AT TIME ZONE 'America/Recife')
        ) AS tarefas_concluidas_anterior
    `);

    return {
      unidadeId: unidade.id,
      totalPendencias: this.calcularPendencias(
        resultado.documentos_proximos,
        resultado.documentos_expirados,
        resultado.tarefas_pendentes,
        resultado.tarefas_em_andamento,
      ),
      documentos: {
        total: resultado.total_documentos,
        valido: resultado.documentos_validos,
        proximoVencimento: resultado.documentos_proximos,
        expirado: resultado.documentos_expirados,
      },
      tarefas: {
        total: resultado.total_tarefas,
        pendente: resultado.tarefas_pendentes,
        emAndamento: resultado.tarefas_em_andamento,
        concluida: resultado.tarefas_concluidas,
      },
      variacao: {
        referencia: 'mes_anterior' as const,
        documentosProximosVencimento: this.calcularVariacao(
          resultado.documentos_proximos,
          resultado.documentos_proximos_anterior,
        ),
        documentosExpirados: this.calcularVariacao(
          resultado.documentos_expirados,
          resultado.documentos_expirados_anterior,
        ),
        tarefasConcluidas: this.calcularVariacao(
          resultado.tarefas_concluidas,
          resultado.tarefas_concluidas_anterior,
        ),
      },
    };
  }
}
