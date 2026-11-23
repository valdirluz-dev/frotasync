import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { calculatePagination } from '../common/utils/pagination.util';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import type { StorageReadResult } from '../storage/interfaces/storage.interface';
import { AnexoUploadFile } from './pipes/anexo-validation.pipe';
import { AtualizarDocumentoDto } from './schemas/atualizar-documento.schema';
import { CriarDocumentoDto } from './schemas/criar-documento.schema';
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

const DOCUMENTO_SELECT_ATUALIZACAO = {
  id: true,
  unidade_id: true,
  unidade: { select: { nome: true } },
  nome: true,
  tipo: true,
  categoria: true,
  data_emissao: true,
  data_validade: true,
  descricao: true,
  anexo_nome: true,
  anexo_url: true,
  anexo_tamanho_bytes: true,
  anexo_tipo: true,
  created_at: true,
  updated_at: true,
} satisfies Prisma.documentoSelect;

type DocumentoPersistido = Prisma.documentoGetPayload<{
  select: typeof DOCUMENTO_SELECT_ATUALIZACAO;
}>;

@Injectable()
export class DocumentosService {
  private readonly logger = new Logger(DocumentosService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async criar(
    unidadeId: string,
    documento: CriarDocumentoDto,
    anexo: AnexoUploadFile,
    empresaId: string,
  ) {
    const unidade = await this.prisma.unidade.findFirst({
      where: {
        id: unidadeId,
        empresa_id: empresaId,
      },
      select: {
        id: true,
        nome: true,
        status: true,
      },
    });

    if (!unidade) {
      throw new NotFoundException({
        message: 'Unidade não encontrada.',
        codigo: 'RECURSO_NAO_ENCONTRADO',
      });
    }

    if (unidade.status !== 'ativa') {
      throw new ConflictException({
        message: 'Não é possível cadastrar documentos em uma unidade inativa.',
        codigo: 'UNIDADE_INATIVA',
      });
    }

    const storageKey = await this.storage.save({
      buffer: anexo.buffer,
      mimeType: anexo.mimetype,
    });

    let documentoPersistido: {
      id: string;
      created_at: Date;
      updated_at: Date;
    };

    try {
      documentoPersistido = await this.prisma.documento.create({
        data: {
          unidade_id: unidade.id,
          nome: documento.nome,
          tipo: documento.tipo ?? null,
          categoria: documento.categoria,
          data_emissao: documento.dataEmissao
            ? this.converterDataNegocio(documento.dataEmissao)
            : null,
          data_validade: this.converterDataNegocio(documento.dataValidade),
          descricao: documento.descricao ?? null,
          anexo_nome: anexo.originalname,
          anexo_url: storageKey,
          anexo_tamanho_bytes: BigInt(anexo.buffer.byteLength),
          anexo_tipo: anexo.mimetype,
        },
        select: {
          id: true,
          created_at: true,
          updated_at: true,
        },
      });
    } catch (erroPersistencia) {
      try {
        await this.storage.delete(storageKey);
      } catch (erroCompensacao) {
        this.logger.error(
          `Falha ao remover anexo após erro de persistência para a unidade ${unidadeId}.`,
          erroCompensacao instanceof Error
            ? erroCompensacao.stack
            : String(erroCompensacao),
        );
      }

      throw erroPersistencia;
    }

    const documentoCriado: DocumentoListagemRow = {
      id: documentoPersistido.id,
      unidade_id: unidade.id,
      unidade_nome: unidade.nome,
      nome: documento.nome,
      tipo: documento.tipo ?? null,
      categoria: documento.categoria,
      data_emissao: documento.dataEmissao ?? null,
      data_validade: documento.dataValidade,
      descricao: documento.descricao ?? null,
      anexo_nome: anexo.originalname,
      anexo_tamanho_bytes: BigInt(anexo.buffer.byteLength),
      anexo_tipo: anexo.mimetype,
      created_at: documentoPersistido.created_at,
      updated_at: documentoPersistido.updated_at,
    };

    return this.mapearDocumento(documentoCriado, this.obterPeriodoValidade());
  }

  async atualizar(
    id: string,
    documento: AtualizarDocumentoDto,
    anexo: AnexoUploadFile | undefined,
    empresaId: string,
  ) {
    const temCamposParaAtualizar = Object.values(documento).some(
      (valor) => valor !== undefined,
    );
    if (!temCamposParaAtualizar && !anexo) {
      throw new BadRequestException(
        'Informe ao menos um campo ou um novo anexo para atualizar.',
      );
    }

    const whereEmpresa = {
      id,
      unidade: { is: { empresa_id: empresaId } },
    };
    const atual = await this.prisma.documento.findFirst({
      where: whereEmpresa,
      select: DOCUMENTO_SELECT_ATUALIZACAO,
    });

    if (!atual) {
      throw new NotFoundException({
        message: 'Documento não encontrado.',
        codigo: 'RECURSO_NAO_ENCONTRADO',
      });
    }

    const dataEmissaoAtual = this.serializarDataNegocio(atual.data_emissao);
    const dataValidadeAtual = this.serializarDataNegocio(atual.data_validade);
    const dataEmissaoFinal = documento.dataEmissao ?? dataEmissaoAtual;
    const dataValidadeFinal = documento.dataValidade ?? dataValidadeAtual;

    this.validarDataNegocio(dataValidadeFinal);
    if (dataEmissaoFinal) {
      this.validarDataNegocio(dataEmissaoFinal);
      if (dataEmissaoFinal > dataValidadeFinal) {
        throw new BadRequestException(
          'A data de emissão não pode ser posterior à data de validade.',
        );
      }
    }

    const dadosAtualizacao: Prisma.documentoUpdateInput = {};
    if (documento.nome !== undefined) {
      dadosAtualizacao.nome = documento.nome;
    }
    if (documento.tipo !== undefined) {
      dadosAtualizacao.tipo = documento.tipo;
    }
    if (documento.categoria !== undefined) {
      dadosAtualizacao.categoria = documento.categoria;
    }
    if (documento.dataEmissao !== undefined) {
      dadosAtualizacao.data_emissao = this.converterDataNegocio(
        documento.dataEmissao,
      );
    }
    if (documento.dataValidade !== undefined) {
      dadosAtualizacao.data_validade = this.converterDataNegocio(
        documento.dataValidade,
      );
    }
    if (documento.descricao !== undefined) {
      dadosAtualizacao.descricao = documento.descricao;
    }

    const novaChaveStorage = anexo
      ? await this.storage.save({
          buffer: anexo.buffer,
          mimeType: anexo.mimetype,
        })
      : undefined;

    if (anexo && novaChaveStorage) {
      dadosAtualizacao.anexo_nome = anexo.originalname;
      dadosAtualizacao.anexo_url = novaChaveStorage;
      dadosAtualizacao.anexo_tamanho_bytes = BigInt(anexo.buffer.byteLength);
      dadosAtualizacao.anexo_tipo = anexo.mimetype;
    }
    dadosAtualizacao.updated_at = new Date();

    let atualizado: DocumentoPersistido;
    try {
      atualizado = await this.prisma.documento.update({
        where: whereEmpresa,
        data: dadosAtualizacao,
        select: DOCUMENTO_SELECT_ATUALIZACAO,
      });
    } catch (erroPersistencia) {
      if (novaChaveStorage) {
        try {
          await this.storage.delete(novaChaveStorage);
        } catch (erroCompensacao) {
          this.logger.error(
            `Falha ao remover novo anexo após erro de atualização do documento ${id}.`,
            erroCompensacao instanceof Error
              ? erroCompensacao.stack
              : String(erroCompensacao),
          );
        }
      }

      throw erroPersistencia;
    }

    if (novaChaveStorage && atual.anexo_url !== novaChaveStorage) {
      try {
        await this.storage.delete(atual.anexo_url);
      } catch (erroLimpeza) {
        this.logger.error(
          `Falha ao remover o anexo anterior do documento ${id}.`,
          erroLimpeza instanceof Error
            ? erroLimpeza.stack
            : String(erroLimpeza),
        );
      }
    }

    return this.mapearDocumento(
      this.converterDocumentoParaListagem(atualizado),
      this.obterPeriodoValidade(),
    );
  }

  async baixarAnexo(
    id: string,
    empresaId: string,
  ): Promise<StorageReadResult & { fileName: string }> {
    const documento = await this.prisma.documento.findFirst({
      where: {
        id,
        unidade: { is: { empresa_id: empresaId } },
      },
      select: {
        anexo_url: true,
        anexo_nome: true,
      },
    });

    if (!documento) {
      throw new NotFoundException({
        message: 'Documento não encontrado.',
        codigo: 'RECURSO_NAO_ENCONTRADO',
      });
    }

    try {
      const arquivo = await this.storage.read(documento.anexo_url);
      return { ...arquivo, fileName: documento.anexo_nome };
    } catch (erroLeitura) {
      this.logger.error(
        `Falha ao ler o anexo do documento ${id}.`,
        erroLeitura instanceof Error ? erroLeitura.stack : String(erroLeitura),
      );
      throw erroLeitura;
    }
  }

  async excluir(id: string, empresaId: string): Promise<void> {
    const whereEmpresa = {
      id,
      unidade: { is: { empresa_id: empresaId } },
    };
    const documento = await this.prisma.documento.findFirst({
      where: whereEmpresa,
      select: DOCUMENTO_SELECT_ATUALIZACAO,
    });

    if (!documento) {
      throw new NotFoundException({
        message: 'Documento não encontrado.',
        codigo: 'RECURSO_NAO_ENCONTRADO',
      });
    }

    // Validate availability before removing the row; the content is not a backup.
    await this.storage.read(documento.anexo_url);

    await this.prisma.documento.delete({ where: whereEmpresa });

    try {
      await this.storage.delete(documento.anexo_url);
    } catch (erroExclusaoArquivo) {
      if (erroExclusaoArquivo instanceof NotFoundException) {
        return;
      }

      try {
        await this.prisma.documento.create({
          data: {
            id: documento.id,
            unidade: { connect: { id: documento.unidade_id } },
            nome: documento.nome,
            tipo: documento.tipo,
            categoria: documento.categoria,
            data_emissao: documento.data_emissao,
            data_validade: documento.data_validade,
            descricao: documento.descricao,
            anexo_nome: documento.anexo_nome,
            anexo_url: documento.anexo_url,
            anexo_tamanho_bytes: documento.anexo_tamanho_bytes,
            anexo_tipo: documento.anexo_tipo,
            created_at: documento.created_at,
            updated_at: documento.updated_at,
          },
        });
      } catch (erroCompensacao) {
        this.logger.error(
          `Falha ao restaurar o documento ${id} após falha ao excluir seu anexo.`,
          erroCompensacao instanceof Error
            ? erroCompensacao.stack
            : String(erroCompensacao),
        );
      }

      throw erroExclusaoArquivo;
    }
  }

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

  async listarCategorias(empresaId: string): Promise<string[]> {
    const categorias = await this.prisma.documento.groupBy({
      by: ['categoria'],
      where: {
        unidade: { is: { empresa_id: empresaId } },
      },
      orderBy: { categoria: 'asc' },
    });

    return categorias
      .filter(({ categoria }) => categoria.trim().length > 0)
      .map(({ categoria }) => categoria);
  }

  async obter(id: string, empresaId: string) {
    const documento = await this.prisma.documento.findFirst({
      where: {
        id,
        unidade: { is: { empresa_id: empresaId } },
      },
      select: DOCUMENTO_SELECT_ATUALIZACAO,
    });

    if (!documento) {
      throw new NotFoundException({
        message: 'Documento não encontrado.',
        codigo: 'RECURSO_NAO_ENCONTRADO',
      });
    }

    return this.mapearDocumento(
      this.converterDocumentoParaListagem(documento),
      this.obterPeriodoValidade(),
    );
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
    const partes = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Recife',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());

    const obterParte = (tipo: Intl.DateTimeFormatPartTypes): string =>
      partes.find((parte) => parte.type === tipo)?.value ?? '';

    const hoje = `${obterParte('year')}-${obterParte('month')}-${obterParte('day')}`;
    const limiteProximoVencimento = new Date(`${hoje}T00:00:00.000Z`);
    limiteProximoVencimento.setUTCDate(
      limiteProximoVencimento.getUTCDate() + 15,
    );

    return {
      hoje,
      limiteProximoVencimento: limiteProximoVencimento
        .toISOString()
        .slice(0, 10),
    };
  }

  private converterDataNegocio(data: string): Date {
    return new Date(`${data}T00:00:00.000Z`);
  }

  private validarDataNegocio(data: string): void {
    const dataConvertida = new Date(`${data}T00:00:00.000Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(data) ||
      !Number.isFinite(dataConvertida.getTime()) ||
      dataConvertida.toISOString().slice(0, 10) !== data
    ) {
      throw new BadRequestException(
        'Data inválida; utilize o formato YYYY-MM-DD.',
      );
    }
  }

  private serializarDataNegocio(data: Date): string;
  private serializarDataNegocio(data: Date | null): string | null;
  private serializarDataNegocio(data: Date | null): string | null {
    if (!data) {
      return null;
    }

    const ano = data.getUTCFullYear().toString().padStart(4, '0');
    const mes = (data.getUTCMonth() + 1).toString().padStart(2, '0');
    const dia = data.getUTCDate().toString().padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  private converterDocumentoParaListagem(
    documento: DocumentoPersistido,
  ): DocumentoListagemRow {
    return {
      id: documento.id,
      unidade_id: documento.unidade_id,
      unidade_nome: documento.unidade.nome,
      nome: documento.nome,
      tipo: documento.tipo,
      categoria: documento.categoria,
      data_emissao: this.serializarDataNegocio(documento.data_emissao),
      data_validade: this.serializarDataNegocio(documento.data_validade),
      descricao: documento.descricao,
      anexo_nome: documento.anexo_nome,
      anexo_tamanho_bytes: documento.anexo_tamanho_bytes,
      anexo_tipo: documento.anexo_tipo,
      created_at: documento.created_at,
      updated_at: documento.updated_at,
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
