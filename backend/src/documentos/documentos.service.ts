import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { calculatePagination } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { ListarDocumentosDto } from './schemas/listar-documentos.schema';

type StatusValidade = 'valido' | 'proximo_vencimento' | 'expirado';

interface PeriodoValidade {
  hoje: string;
  limiteProximoVencimento: string;
}

interface DocumentoListagemRow {
  id: string;
  unidade_id: string;
  unidade_nome: string;
  nome: string;
  tipo: string | null;
  categoria: string;
  data_emissao: string | null;
  data_validade: string;
  descricao: string | null;
  anexo_nome: string;
  anexo_tamanho_bytes: bigint;
  anexo_tipo: string;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class DocumentosService {
  constructor(private readonly prisma: PrismaService) {}

  listar(filtros: ListarDocumentosDto, empresaId: string) {
    return this.listarComFiltros(filtros, empresaId);
  }

  listarPorUnidade(
    unidadeId: string,
    filtros: ListarDocumentosDto,
    empresaId: string,
  ) {
    return this.listarComFiltros(filtros, empresaId, unidadeId);
  }

  private async listarComFiltros(
    filtros: ListarDocumentosDto,
    empresaId: string,
    unidadeId?: string,
  ) {
    const periodoValidade = this.obterPeriodoValidade();
    const where = this.construirFiltros(
      filtros,
      empresaId,
      periodoValidade,
      unidadeId,
    );

    const resultadoContagem = await this.prisma.$queryRaw<
      { total: number }[]
    >(Prisma.sql`
      SELECT COUNT(*)::int AS total
      FROM documento d
      INNER JOIN unidade u ON u.id = d.unidade_id
      WHERE ${where}
    `);
    const total = resultadoContagem[0]?.total ?? 0;
    const paginacao = calculatePagination(filtros, total);

    const documentos = await this.prisma.$queryRaw<DocumentoListagemRow[]>(
      Prisma.sql`
        SELECT
          d.id,
          d.unidade_id,
          u.nome AS unidade_nome,
          d.nome,
          d.tipo,
          d.categoria,
          to_char(d.data_emissao, 'YYYY-MM-DD') AS data_emissao,
          to_char(d.data_validade, 'YYYY-MM-DD') AS data_validade,
          d.descricao,
          d.anexo_nome,
          d.anexo_tamanho_bytes,
          d.anexo_tipo,
          d.created_at,
          d.updated_at
        FROM documento d
        INNER JOIN unidade u ON u.id = d.unidade_id
        WHERE ${where}
        ORDER BY d.data_validade ASC, d.id ASC
        LIMIT ${paginacao.take}
        OFFSET ${paginacao.skip}
      `,
    );

    return {
      items: documentos.map((documento) =>
        this.mapearDocumento(documento, periodoValidade),
      ),
      page: paginacao.page,
      pageSize: paginacao.pageSize,
      total: paginacao.total,
      totalPages: paginacao.totalPages,
    };
  }

  private construirFiltros(
    filtros: ListarDocumentosDto,
    empresaId: string,
    periodoValidade: PeriodoValidade,
    unidadeId?: string,
  ) {
    const condicoes = [Prisma.sql`u.empresa_id = ${empresaId}::uuid`];
    const unidadeFiltrada = unidadeId ?? filtros.unidadeId;

    if (unidadeFiltrada) {
      condicoes.push(Prisma.sql`u.id = ${unidadeFiltrada}::uuid`);
    }

    if (filtros.q) {
      condicoes.push(Prisma.sql`
        unaccent(lower(d.nome))
          LIKE unaccent(lower(${this.criarPadraoBusca(filtros.q)}))
          ESCAPE '\\'
      `);
    }

    if (filtros.categoria) {
      condicoes.push(Prisma.sql`d.categoria = ${filtros.categoria}`);
    }

    if (filtros.statusValidade) {
      condicoes.push(
        this.construirFiltroValidade(filtros.statusValidade, periodoValidade),
      );
    }

    return Prisma.join(condicoes, ' AND ');
  }

  private construirFiltroValidade(
    statusValidade: StatusValidade,
    periodoValidade: PeriodoValidade,
  ) {
    switch (statusValidade) {
      case 'expirado':
        return Prisma.sql`d.data_validade < ${periodoValidade.hoje}::date`;
      case 'proximo_vencimento':
        return Prisma.sql`
          d.data_validade >= ${periodoValidade.hoje}::date
          AND d.data_validade <= ${periodoValidade.limiteProximoVencimento}::date
        `;
      case 'valido':
        return Prisma.sql`d.data_validade > ${periodoValidade.limiteProximoVencimento}::date`;
    }
  }

  private criarPadraoBusca(q: string): string {
    const escapado = q
      .replaceAll('\\', '\\\\')
      .replaceAll('%', '\\%')
      .replaceAll('_', '\\_');

    return `%${escapado}%`;
  }

  private obterPeriodoValidade(): PeriodoValidade {
    const agora = new Date();
    const hoje = new Date(
      Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate()),
    );
    const limiteProximoVencimento = new Date(hoje);
    limiteProximoVencimento.setUTCDate(
      limiteProximoVencimento.getUTCDate() + 15,
    );

    return {
      hoje: hoje.toISOString().slice(0, 10),
      limiteProximoVencimento: limiteProximoVencimento
        .toISOString()
        .slice(0, 10),
    };
  }

  private mapearDocumento(
    documento: DocumentoListagemRow,
    periodoValidade: PeriodoValidade,
  ) {
    return {
      id: documento.id,
      unidadeId: documento.unidade_id,
      unidadeNome: documento.unidade_nome,
      nome: documento.nome,
      tipo: documento.tipo,
      categoria: documento.categoria,
      dataEmissao: documento.data_emissao,
      dataValidade: documento.data_validade,
      descricao: documento.descricao,
      statusValidade: this.calcularStatusValidade(
        documento.data_validade,
        periodoValidade,
      ),
      anexo: {
        nome: documento.anexo_nome,
        tamanhoBytes: Number(documento.anexo_tamanho_bytes),
        tipo: documento.anexo_tipo,
        url: `/api/v1/documentos/${documento.id}/anexo`,
      },
      criadoEm: documento.created_at.toISOString(),
      atualizadoEm: documento.updated_at.toISOString(),
    };
  }

  private calcularStatusValidade(
    dataValidade: string,
    periodoValidade: PeriodoValidade,
  ): StatusValidade {
    if (dataValidade < periodoValidade.hoje) {
      return 'expirado';
    }

    if (dataValidade <= periodoValidade.limiteProximoVencimento) {
      return 'proximo_vencimento';
    }

    return 'valido';
  }
}
