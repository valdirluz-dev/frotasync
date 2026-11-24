import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ListarUnidadesDto } from './schemas/listar-unidades.schema';
import { Prisma } from '../../generated/prisma/client';
@Injectable()
export class UnidadesService {
  constructor(private readonly prisma: PrismaService) {}

  private construirWhere(filtros: ListarUnidadesDto, empresaId: string) {
    return {
      empresa_id: empresaId,
      ...(filtros.status && {
        status: filtros.status,
      }),
    };
  }

  private construirBusca(
    q: string,
    empresaId: string,
    status: string | undefined,
    pageSize: number,
    offset: number,
  ) {
    const padraoBusca = this.criarPadraoBusca(q);
    return Prisma.sql`
      SELECT u.*,
        (SELECT COUNT(*)::int FROM documento d WHERE d.unidade_id = u.id) AS total_documentos,
        (SELECT COUNT(*)::int FROM tarefa t WHERE t.unidade_id = u.id) AS total_tarefas
      FROM unidade u
      WHERE u.empresa_id = ${empresaId}::uuid
        AND (${status === undefined ? Prisma.sql`TRUE` : Prisma.sql`u.status = ${status}`})
        AND (
          unaccent(lower(u.nome)) LIKE unaccent(lower(${padraoBusca})) ESCAPE '\\'
          OR unaccent(lower(u.codigo)) LIKE unaccent(lower(${padraoBusca})) ESCAPE '\\'
        )
      ORDER BY u.nome ASC, u.id ASC
      LIMIT ${pageSize}
      OFFSET ${offset}
    `;
  }

  private construirContagemBusca(
    q: string,
    empresaId: string,
    status?: string,
  ) {
    const padraoBusca = this.criarPadraoBusca(q);
    return Prisma.sql`
      SELECT COUNT(*)::int AS total
      FROM unidade u
      WHERE u.empresa_id = ${empresaId}::uuid
        AND (${status === undefined ? Prisma.sql`TRUE` : Prisma.sql`u.status = ${status}`})
        AND (
          unaccent(lower(u.nome)) LIKE unaccent(lower(${padraoBusca})) ESCAPE '\\'
          OR unaccent(lower(u.codigo)) LIKE unaccent(lower(${padraoBusca})) ESCAPE '\\'
        )
    `;
  }

  private criarPadraoBusca(q: string): string {
    const escapado = q
      .replaceAll('\\', '\\\\')
      .replaceAll('%', '\\%')
      .replaceAll('_', '\\_');
    return `%${escapado}%`;
  }

  private mapearUnidade(unidade: {
    id: string;
    nome: string;
    codigo: string;
    status: string;
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string | null;
    bairro: string;
    cidade: string;
    uf: string;
    descricao: string | null;
    created_at: Date;
    updated_at: Date;
    _count?: { documento: number; tarefa: number };
    total_documentos?: number;
    total_tarefas?: number;
  }) {
    return {
      id: unidade.id,
      nome: unidade.nome,
      codigo: unidade.codigo,
      status: unidade.status,
      endereco: {
        cep: unidade.cep,
        logradouro: unidade.logradouro,
        numero: unidade.numero,
        complemento: unidade.complemento ?? undefined,
        bairro: unidade.bairro,
        cidade: unidade.cidade,
        uf: unidade.uf,
      },
      descricao: unidade.descricao ?? undefined,
      criadoEm: unidade.created_at.toISOString(),
      atualizadoEm: unidade.updated_at.toISOString(),
      totalDocumentos:
        unidade._count?.documento ?? unidade.total_documentos ?? 0,
      totalTarefas: unidade._count?.tarefa ?? unidade.total_tarefas ?? 0,
    };
  }

  async obter(id: string, empresaId: string) {
    const unidade = await this.prisma.unidade.findFirst({
      where: {
        id,
        empresa_id: empresaId,
      },
      select: {
        id: true,
        nome: true,
        codigo: true,
        status: true,
        cep: true,
        logradouro: true,
        numero: true,
        complemento: true,
        bairro: true,
        cidade: true,
        uf: true,
        descricao: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            documento: true,
            tarefa: true,
          },
        },
      },
    });

    if (!unidade) {
      throw new NotFoundException({
        message: 'Unidade não encontrada.',
        codigo: 'RECURSO_NAO_ENCONTRADO',
      });
    }

    return this.mapearUnidade(unidade);
  }

  async listar(filtros: ListarUnidadesDto, empresaId: string) {
    const where = this.construirWhere(filtros, empresaId);
    const total = filtros.q
      ? ((
          await this.prisma.$queryRaw<{ total: number }[]>(
            this.construirContagemBusca(
              filtros.q,
              empresaId,
              filtros.status,
            ),
          )
        )[0]?.total ?? 0)
      : await this.prisma.unidade.count({
          where,
        });

    const totalPages = Math.max(1, Math.ceil(total / filtros.pageSize));

    const page = Math.min(filtros.page, totalPages);

    const offset = (page - 1) * filtros.pageSize;

    const unidades = filtros.q
      ? await this.prisma.$queryRaw<Prisma.unidadeModel[]>(
          this.construirBusca(
            filtros.q,
            empresaId,
            filtros.status,
            filtros.pageSize,
            offset,
          ),
        )
      : await this.prisma.unidade.findMany({
          where,
          skip: offset,
          take: filtros.pageSize,
          orderBy: [
            { nome: 'asc' },
            { id: 'asc' },
          ],
          select: {
            id: true,
            nome: true,
            codigo: true,
            status: true,
            cep: true,
            logradouro: true,
            numero: true,
            complemento: true,
            bairro: true,
            cidade: true,
            uf: true,
            descricao: true,
            created_at: true,
            updated_at: true,
            _count: {
              select: {
                documento: true,
                tarefa: true,
              },
            },
          },
        });

    return {
      items: unidades.map((unidade) =>
        this.mapearUnidade(
          unidade as unknown as {
            id: string;
            nome: string;
            codigo: string;
            status: string;
            cep: string;
            logradouro: string;
            numero: string;
            complemento: string | null;
            bairro: string;
            cidade: string;
            uf: string;
            descricao: string | null;
            created_at: Date;
            updated_at: Date;
            _count?: { documento: number; tarefa: number };
          },
        ),
      ),
      page,
      pageSize: filtros.pageSize,
      total,
      totalPages,
    };
  }
}
