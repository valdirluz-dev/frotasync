import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { calculatePagination } from '../common/utils/pagination.util';
import type { CriarTarefaDto } from './schemas/criar-tarefa.schema';
import type { AtualizarTarefaDto } from './schemas/atualizar-tarefa.schema';
import type { AtualizarStatusTarefaDto } from './schemas/atualizar-status-tarefa.schema';
import type {
  ListarTarefasDto,
  ListarTarefasPorUnidadeDto,
} from './schemas/listar-tarefas.schema';

@Injectable()
export class TarefasService {
  constructor(private readonly prisma: PrismaService) {}

  private converterDataNegocio(data: string): Date {
    return new Date(`${data}T00:00:00.000Z`);
  }

  private serializarDataNegocio(data: Date | null): string | null {
    return data?.toISOString().slice(0, 10) ?? null;
  }

  private obterHoje(): string {
    return new Date().toISOString().slice(0, 10);
  }

  async criar(
    unidadeId: string,
    tarefa: CriarTarefaDto,
    empresaId: string,
  ) {
    const unidade = await this.prisma.unidade.findFirst({
      where: { id: unidadeId, empresa_id: empresaId },
      select: { id: true, nome: true, status: true },
    });

    if (!unidade) {
      throw new NotFoundException({
        message: 'Unidade não encontrada.',
        codigo: 'RECURSO_NAO_ENCONTRADO',
      });
    }

    if (unidade.status !== 'ativa') {
      throw new ConflictException({
        message: 'Não é possível cadastrar tarefas em uma unidade inativa.',
        codigo: 'UNIDADE_INATIVA',
      });
    }

    const agora = new Date();
    const dataInicio = new Date(
      Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate()),
    );

    const criada = await this.prisma.tarefa.create({
      data: {
        unidade_id: unidade.id,
        titulo: tarefa.titulo,
        descricao: tarefa.descricao ?? null,
        status: 'pendente',
        data_inicio: dataInicio,
        prazo: this.converterDataNegocio(tarefa.prazoFinal),
      },
      include: {
        unidade: { select: { nome: true } },
      },
    });

    return this.mapearTarefa(criada);
  }

  async obter(id: string, empresaId: string) {
    const tarefa = await this.prisma.tarefa.findFirst({
      where: {
        id,
        unidade: { is: { empresa_id: empresaId } },
      },
      include: {
        unidade: { select: { nome: true } },
      },
    });

    if (!tarefa) {
      throw new NotFoundException({
        message: 'Tarefa não encontrada.',
        codigo: 'RECURSO_NAO_ENCONTRADO',
      });
    }

    return this.mapearTarefa(tarefa);
  }

  async atualizar(id: string, dados: AtualizarTarefaDto, empresaId: string) {
    const atual = await this.prisma.tarefa.findFirst({
      where: { id, unidade: { is: { empresa_id: empresaId } } },
      include: { unidade: { select: { nome: true, status: true } } },
    });

    if (!atual) {
      throw new NotFoundException({
        message: 'Tarefa não encontrada.',
        codigo: 'RECURSO_NAO_ENCONTRADO',
      });
    }

    if (atual.unidade.status !== 'ativa') {
      throw new ConflictException({
        message: 'Não é possível atualizar tarefas de uma unidade inativa.',
        codigo: 'UNIDADE_INATIVA',
      });
    }

    if (
      dados.prazoFinal !== undefined &&
      dados.prazoFinal !== this.serializarDataNegocio(atual.prazo) &&
      dados.prazoFinal < this.obterHoje()
    ) {
      throw new BadRequestException({
        message: 'O novo prazo não pode ser anterior à data atual.',
        campo: 'prazoFinal',
      });
    }

    const data: Prisma.tarefaUpdateInput = {};
    if (dados.titulo !== undefined) data.titulo = dados.titulo;
    if (dados.descricao !== undefined) data.descricao = dados.descricao;
    if (dados.prazoFinal !== undefined) {
      data.prazo = this.converterDataNegocio(dados.prazoFinal);
    }
    data.updated_at = new Date();

    const atualizada = await this.prisma.tarefa.update({
      where: { id },
      data,
      include: { unidade: { select: { nome: true } } },
    });

    return this.mapearTarefa(atualizada);
  }

  async atualizarStatus(
    id: string,
    dados: AtualizarStatusTarefaDto,
    empresaId: string,
  ) {
    const atual = await this.prisma.tarefa.findFirst({
      where: { id, unidade: { is: { empresa_id: empresaId } } },
      include: { unidade: { select: { nome: true, status: true } } },
    });

    if (!atual) {
      throw new NotFoundException({
        message: 'Tarefa não encontrada.',
        codigo: 'RECURSO_NAO_ENCONTRADO',
      });
    }

    if (atual.unidade.status !== 'ativa') {
      throw new ConflictException({
        message: 'Não é possível alterar o status de tarefas de uma unidade inativa.',
        codigo: 'UNIDADE_INATIVA',
      });
    }

    if (atual.status === dados.status) {
      return this.mapearTarefa(atual);
    }

    const agora = new Date();

    const atualizada = await this.prisma.$transaction(async (tx) => {
      const tarefaAtualizada = await tx.tarefa.update({
        where: { id },
        data: {
          status: dados.status,
          data_conclusao: dados.status === 'concluida' ? agora : null,
          updated_at: agora,
        },
        include: { unidade: { select: { nome: true } } },
      });

      await tx.unidade.update({
        where: { id: atual.unidade_id },
        data: { updated_at: agora },
      });

      return tarefaAtualizada;
    });

    return this.mapearTarefa(atualizada);
  }

  async excluir(id: string, empresaId: string): Promise<void> {
    const atual = await this.prisma.tarefa.findFirst({
      where: { id, unidade: { is: { empresa_id: empresaId } } },
      select: { id: true },
    });

    if (!atual) {
      throw new NotFoundException({
        message: 'Tarefa não encontrada.',
        codigo: 'RECURSO_NAO_ENCONTRADO',
      });
    }

    await this.prisma.tarefa.delete({
      where: { id: atual.id },
    });
  }

  listar(filtros: ListarTarefasDto, empresaId: string) {
    return this.listarComFiltros(filtros, empresaId);
  }

  listarPorUnidade(
    unidadeId: string,
    filtros: ListarTarefasPorUnidadeDto,
    empresaId: string,
  ) {
    return this.listarComFiltros(filtros, empresaId, unidadeId);
  }

  private async listarComFiltros(
    filtros: ListarTarefasDto | ListarTarefasPorUnidadeDto,
    empresaId: string,
    unidadeId?: string,
  ) {
    const where = this.construirFiltros(filtros, empresaId, unidadeId);

    const resultadoContagem = await this.prisma.$queryRaw<
      { total: number }[]
    >(Prisma.sql`
      SELECT COUNT(*)::int AS total
      FROM tarefa t
      INNER JOIN unidade u ON u.id = t.unidade_id
      WHERE ${where}
    `);

    const total = resultadoContagem[0]?.total ?? 0;
    const paginacao = calculatePagination(filtros, total);

    const tarefas = await this.prisma.$queryRaw<
      {
        id: string;
        unidade_id: string;
        unidade_nome: string;
        titulo: string;
        descricao: string | null;
        status: string;
        data_inicio: string;
        prazo: string;
        data_conclusao: Date | null;
        created_at: Date;
        updated_at: Date;
      }[]
    >(Prisma.sql`
      SELECT
        t.id,
        t.unidade_id,
        u.nome AS unidade_nome,
        t.titulo,
        t.descricao,
        t.status,
        to_char(t.data_inicio, 'YYYY-MM-DD') AS data_inicio,
        to_char(t.prazo, 'YYYY-MM-DD') AS prazo,
        t.data_conclusao,
        t.created_at,
        t.updated_at
      FROM tarefa t
      INNER JOIN unidade u ON u.id = t.unidade_id
      WHERE ${where}
      ORDER BY t.prazo ASC, t.id ASC
      LIMIT ${paginacao.take}
      OFFSET ${paginacao.skip}
    `);

    return {
      items: tarefas.map((tarefa) => ({
        id: tarefa.id,
        unidadeId: tarefa.unidade_id,
        unidadeNome: tarefa.unidade_nome,
        titulo: tarefa.titulo,
        descricao: tarefa.descricao,
        status: tarefa.status,
        dataInicio: tarefa.data_inicio,
        prazoFinal: tarefa.prazo,
        dataConclusao: tarefa.data_conclusao?.toISOString() ?? null,
        criadoEm: tarefa.created_at.toISOString(),
        atualizadoEm: tarefa.updated_at.toISOString(),
      })),
      page: paginacao.page,
      pageSize: paginacao.pageSize,
      total: paginacao.total,
      totalPages: paginacao.totalPages,
    };
  }

  private construirFiltros(
    filtros: ListarTarefasDto | ListarTarefasPorUnidadeDto,
    empresaId: string,
    unidadeId?: string,
  ) {
    const condicoes = [Prisma.sql`u.empresa_id = ${empresaId}::uuid`];
    const unidadeFiltrada =
      unidadeId ??
      ('unidadeId' in filtros ? filtros.unidadeId : undefined);

    if (unidadeFiltrada) {
      condicoes.push(Prisma.sql`u.id = ${unidadeFiltrada}::uuid`);
    }

    if (filtros.q) {
      condicoes.push(Prisma.sql`
        unaccent(lower(t.titulo))
          LIKE unaccent(lower(${this.criarPadraoBusca(filtros.q)}))
          ESCAPE '\\'
      `);
    }

    if (filtros.status) {
      condicoes.push(Prisma.sql`t.status = ${filtros.status}`);
    }

    return Prisma.join(condicoes, ' AND ');
  }

  private criarPadraoBusca(q: string): string {
    const escapado = q
      .replaceAll('\\', '\\\\')
      .replaceAll('%', '\\%')
      .replaceAll('_', '\\_');

    return `%${escapado}%`;
  }

  private mapearTarefa(tarefa: {
    id: string;
    unidade_id: string;
    unidade: { nome: string };
    titulo: string;
    descricao: string | null;
    status: string;
    data_inicio: Date;
    prazo: Date;
    data_conclusao: Date | null;
    created_at: Date;
    updated_at: Date;
  }) {
    return {
      id: tarefa.id,
      unidadeId: tarefa.unidade_id,
      unidadeNome: tarefa.unidade.nome,
      titulo: tarefa.titulo,
      descricao: tarefa.descricao,
      status: tarefa.status,
      dataInicio: this.serializarDataNegocio(tarefa.data_inicio),
      prazoFinal: this.serializarDataNegocio(tarefa.prazo),
      dataConclusao: tarefa.data_conclusao?.toISOString() ?? null,
      criadoEm: tarefa.created_at.toISOString(),
      atualizadoEm: tarefa.updated_at.toISOString(),
    };
  }
}
