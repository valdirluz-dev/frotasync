import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import {
  BadRequestException,
  ConflictException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AnexoUploadFile } from './pipes/anexo-validation.pipe';
import { AtualizarDocumentoDto } from './schemas/atualizar-documento.schema';
import { CriarDocumentoDto } from './schemas/criar-documento.schema';
import { ListarDocumentosDto } from './schemas/listar-documentos.schema';
import { DocumentosService } from './documentos.service';

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

interface DocumentoPersistidoTeste {
  id: string;
  unidade_id: string;
  unidade: { nome: string };
  nome: string;
  tipo: string | null;
  categoria: string;
  data_emissao: Date | null;
  data_validade: Date;
  descricao: string | null;
  anexo_nome: string;
  anexo_url: string;
  anexo_tamanho_bytes: bigint;
  anexo_tipo: string;
  created_at: Date;
  updated_at: Date;
}

const empresaId = 'c3c4a4b7-14ba-4204-a341-7896853621b4';
const unidadeId = 'd9428888-122b-4b42-9acc-2a83c47b3f6e';
const dataHoje = '2026-06-15';
const filtrosPadrao: ListarDocumentosDto = { page: 1, pageSize: 20 };

const prismaMock = {
  $queryRaw: jest.fn<(query: unknown) => Promise<unknown[]>>(),
  unidade: {
    findFirst:
      jest.fn<
        (
          args: unknown,
        ) => Promise<{ id: string; nome: string; status: string } | null>
      >(),
  },
  documento: {
    groupBy:
      jest.fn<(args: unknown) => Promise<Array<{ categoria: string }>>>(),
    create:
      jest.fn<
        (
          args: unknown,
        ) => Promise<{ id: string; created_at: Date; updated_at: Date }>
      >(),
    findFirst:
      jest.fn<(args: unknown) => Promise<DocumentoPersistidoTeste | null>>(),
    update: jest.fn<(args: unknown) => Promise<DocumentoPersistidoTeste>>(),
    delete: jest.fn<(args: unknown) => Promise<{ id: string }>>(),
  },
};

const storageMock = {
  save: jest.fn<
    (input: { buffer: Buffer; mimeType: string }) => Promise<string>
  >(),
  read: jest.fn<
    (key: string) => Promise<{ buffer: Buffer; mimeType: string; size: number }>
  >(),
  delete: jest.fn<(key: string) => Promise<void>>(),
};

let service: DocumentosService;

const documentoParaCriar: CriarDocumentoDto = {
  nome: 'Licença Ambiental',
  tipo: 'Licença',
  categoria: 'Ambiental',
  dataEmissao: '2026-06-01',
  dataValidade: '2026-06-30',
  descricao: 'Licença anual',
};

const anexoParaCriar: AnexoUploadFile = {
  originalname: 'licenca.pdf',
  buffer: Buffer.from('%PDF-1.7\nconteúdo'),
  mimetype: 'application/pdf',
  size: Buffer.byteLength('%PDF-1.7\nconteúdo'),
};

const anexoParaAtualizar: AnexoUploadFile = {
  originalname: 'licenca-atualizada.pdf',
  buffer: Buffer.from('%PDF-1.7\nnovo conteúdo'),
  mimetype: 'application/pdf',
  size: Buffer.byteLength('%PDF-1.7\nnovo conteúdo'),
};

function criarDocumentoRow(
  overrides: Partial<DocumentoListagemRow> = {},
): DocumentoListagemRow {
  return {
    id: 'a0cd295f-5787-493b-a3d0-c85029a75fc8',
    unidade_id: unidadeId,
    unidade_nome: 'Unidade Norte',
    nome: 'Licença Ambiental',
    tipo: 'Licença',
    categoria: 'Ambiental',
    data_emissao: '2025-06-15',
    data_validade: dataHoje,
    descricao: 'Licença anual',
    anexo_nome: 'licenca.pdf',
    anexo_tamanho_bytes: 482311n,
    anexo_tipo: 'application/pdf',
    created_at: new Date('2026-06-15T10:00:00.000Z'),
    updated_at: new Date('2026-06-15T11:00:00.000Z'),
    ...overrides,
  };
}

function configurarResultados(total: number, documentos: unknown[] = []): void {
  prismaMock.$queryRaw
    .mockResolvedValueOnce([{ total }])
    .mockResolvedValueOnce(documentos);
}

function configurarCriacao(status = 'ativa'): void {
  prismaMock.unidade.findFirst.mockResolvedValue({
    id: unidadeId,
    nome: 'Unidade Norte',
    status,
  });
  storageMock.save.mockResolvedValue('storage-private-key');
  prismaMock.documento.create.mockResolvedValue({
    id: 'a0cd295f-5787-493b-a3d0-c85029a75fc8',
    created_at: new Date('2026-06-15T10:00:00.000Z'),
    updated_at: new Date('2026-06-15T11:00:00.000Z'),
  });
}

function criarDocumentoPersistido(
  overrides: Partial<DocumentoPersistidoTeste> = {},
): DocumentoPersistidoTeste {
  return {
    id: 'a0cd295f-5787-493b-a3d0-c85029a75fc8',
    unidade_id: unidadeId,
    unidade: { nome: 'Unidade Norte' },
    nome: 'Licença Ambiental',
    tipo: 'Licença',
    categoria: 'Ambiental',
    data_emissao: new Date('2026-06-01T00:00:00.000Z'),
    data_validade: new Date('2026-06-30T00:00:00.000Z'),
    descricao: 'Licença anual',
    anexo_nome: 'licenca.pdf',
    anexo_url: 'old-storage-key',
    anexo_tamanho_bytes: 482311n,
    anexo_tipo: 'application/pdf',
    created_at: new Date('2026-06-10T10:00:00.000Z'),
    updated_at: new Date('2026-06-11T11:00:00.000Z'),
    ...overrides,
  };
}

function configurarAtualizacao(documento = criarDocumentoPersistido()): void {
  prismaMock.documento.findFirst.mockResolvedValue(documento);
  prismaMock.documento.update.mockImplementation(async (args) => {
    const data = (args as { data: Partial<DocumentoPersistidoTeste> }).data;
    return { ...documento, ...data };
  });
  prismaMock.documento.create.mockResolvedValue({
    id: documento.id,
    created_at: documento.created_at,
    updated_at: documento.updated_at,
  });
  prismaMock.documento.delete.mockResolvedValue({ id: documento.id });
  storageMock.save.mockResolvedValue('new-storage-key');
  storageMock.read.mockResolvedValue({
    buffer: Buffer.from('%PDF-1.7\nconteúdo original'),
    mimeType: 'application/pdf',
    size: Buffer.byteLength('%PDF-1.7\nconteúdo original'),
  });
  storageMock.delete.mockResolvedValue();
}

function consultarQuery(indice: number): {
  sql: string;
  values: unknown[];
} {
  const query = prismaMock.$queryRaw.mock.calls[indice][0] as {
    strings: string[];
    values: unknown[];
  };

  return {
    sql: query.strings.join(''),
    values: query.values,
  };
}

describe('DocumentosService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-06-15T23:45:00.000Z'));
    prismaMock.$queryRaw.mockReset();
    prismaMock.unidade.findFirst.mockReset();
    prismaMock.documento.create.mockReset();
    prismaMock.documento.groupBy.mockReset();
    prismaMock.documento.findFirst.mockReset();
    prismaMock.documento.update.mockReset();
    prismaMock.documento.delete.mockReset();
    storageMock.save.mockReset();
    storageMock.read.mockReset();
    storageMock.delete.mockReset();
    service = new DocumentosService(
      prismaMock as unknown as PrismaService,
      storageMock as unknown as StorageService,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('usa a data civil de Recife quando o UTC já avançou para o dia seguinte', async () => {
    jest.setSystemTime(new Date('2026-06-16T02:30:00.000Z'));
    configurarResultados(0);

    await service.listar(
      { ...filtrosPadrao, statusValidade: 'proximo_vencimento' },
      empresaId,
    );

    const contagem = consultarQuery(0);
    expect(contagem.values).toContain('2026-06-15');
    expect(contagem.values).toContain('2026-06-30');
  });

  it('limita a listagem global à empresa autenticada em contagem e resultados', async () => {
    configurarResultados(0);

    await service.listar(filtrosPadrao, empresaId);

    expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(2);
    for (const indice of [0, 1]) {
      const query = consultarQuery(indice);
      expect(query.sql).toContain('u.empresa_id = ');
      expect(query.values).toContain(empresaId);
    }
  });

  it('lista por unidade aplicando simultaneamente unidade e empresa', async () => {
    configurarResultados(0);

    const resultado = await service.listarPorUnidade(
      unidadeId,
      filtrosPadrao,
      empresaId,
    );

    expect(resultado.total).toBe(0);
    for (const indice of [0, 1]) {
      const query = consultarQuery(indice);
      expect(query.sql).toContain('u.empresa_id = ');
      expect(query.sql).toContain('u.id = ');
      expect(query.values).toContain(empresaId);
      expect(query.values).toContain(unidadeId);
    }
  });

  it('não revela documentos de unidade de outra empresa', async () => {
    configurarResultados(0);

    const resultado = await service.listarPorUnidade(
      unidadeId,
      filtrosPadrao,
      empresaId,
    );

    expect(resultado).toEqual({
      items: [],
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 1,
    });
    expect(consultarQuery(0).sql).toContain('u.empresa_id = ');
    expect(consultarQuery(0).sql).toContain('u.id = ');
  });

  it('pesquisa sem acentos e sem diferenciar maiúsculas pelo nome do documento', async () => {
    configurarResultados(0);

    await service.listar({ ...filtrosPadrao, q: 'Sao Joao' }, empresaId);

    const query = consultarQuery(0);
    expect(query.sql).toContain('unaccent(lower(d.nome))');
    expect(query.sql).toContain('LIKE unaccent(lower(');
    expect(query.sql).not.toContain('unaccent(lower(u.nome))');
    expect(query.values).toContain('%Sao Joao%');
  });

  it('escapa barra invertida, percentual e sublinhado na busca', async () => {
    configurarResultados(0);

    await service.listar({ ...filtrosPadrao, q: '100%_A\\B' }, empresaId);

    expect(consultarQuery(0).values).toContain('%100\\%\\_A\\\\B%');
  });

  it('aplica filtros de categoria, busca, unidade e status na contagem', async () => {
    configurarResultados(0);

    await service.listar(
      {
        ...filtrosPadrao,
        q: 'Ambiental',
        categoria: 'Legal',
        unidadeId,
        statusValidade: 'expirado',
      },
      empresaId,
    );

    const query = consultarQuery(0);
    expect(query.sql).toContain('u.empresa_id = ');
    expect(query.sql).toContain('u.id = ');
    expect(query.sql).toContain('d.categoria = ');
    expect(query.sql).toContain('unaccent(lower(d.nome))');
    expect(query.sql).toContain('d.data_validade < ');
    expect(query.values).toEqual(
      expect.arrayContaining([
        empresaId,
        unidadeId,
        'Legal',
        '%Ambiental%',
        dataHoje,
      ]),
    );
  });

  it('filtra documentos expirados antes da contagem e calcula o status', async () => {
    configurarResultados(1, [
      criarDocumentoRow({ data_validade: '2026-06-14' }),
    ]);

    const resultado = await service.listar(
      { ...filtrosPadrao, statusValidade: 'expirado' },
      empresaId,
    );

    const contagem = consultarQuery(0);
    expect(contagem.sql).toContain('d.data_validade < ');
    expect(contagem.values).toContain(dataHoje);
    expect(resultado.items[0].statusValidade).toBe('expirado');
  });

  it('inclui hoje e o 15º dia nos próximos vencimentos', async () => {
    configurarResultados(2, [
      criarDocumentoRow({ data_validade: dataHoje }),
      criarDocumentoRow({
        id: 'cddc2180-458e-450c-9397-20ec77d4e5ac',
        data_validade: '2026-06-30',
      }),
    ]);

    const resultado = await service.listar(
      { ...filtrosPadrao, statusValidade: 'proximo_vencimento' },
      empresaId,
    );

    const contagem = consultarQuery(0);
    expect(contagem.sql).toContain('d.data_validade >= ');
    expect(contagem.sql).toContain('d.data_validade <= ');
    expect(contagem.values).toContain(dataHoje);
    expect(contagem.values).toContain('2026-06-30');
    expect(resultado.items.map((item) => item.statusValidade)).toEqual([
      'proximo_vencimento',
      'proximo_vencimento',
    ]);
  });

  it('classifica como válido a partir do 16º dia', async () => {
    configurarResultados(1, [
      criarDocumentoRow({ data_validade: '2026-07-01' }),
    ]);

    const resultado = await service.listar(
      { ...filtrosPadrao, statusValidade: 'valido' },
      empresaId,
    );

    const contagem = consultarQuery(0);
    expect(contagem.sql).toContain('d.data_validade > ');
    expect(contagem.values).toContain('2026-06-30');
    expect(resultado.items[0].statusValidade).toBe('valido');
  });

  it('ordena por data de validade e ID em ordem crescente', async () => {
    configurarResultados(0);

    await service.listar(filtrosPadrao, empresaId);

    expect(consultarQuery(1).sql).toContain(
      'ORDER BY d.data_validade ASC, d.id ASC',
    );
  });

  it('calcula skip e take usando a página e o tamanho solicitados', async () => {
    configurarResultados(45);

    await service.listar({ page: 2, pageSize: 10 }, empresaId);

    const query = consultarQuery(1);
    expect(query.sql).toContain('LIMIT ');
    expect(query.sql).toContain('OFFSET ');
    expect(query.values.filter((value) => value === 10)).toHaveLength(2);
  });

  it('ajusta a página solicitada para a última página válida', async () => {
    configurarResultados(45);

    const resultado = await service.listar(
      { page: 99, pageSize: 20 },
      empresaId,
    );

    expect(resultado).toEqual({
      items: [],
      page: 3,
      pageSize: 20,
      total: 45,
      totalPages: 3,
    });
    expect(consultarQuery(1).values).toContain(40);
  });

  it('retorna página 1 e totalPages 1 quando não há resultados', async () => {
    configurarResultados(0);

    const resultado = await service.listar(
      { page: 5, pageSize: 20 },
      empresaId,
    );

    expect(resultado).toEqual({
      items: [],
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 1,
    });
    expect(consultarQuery(1).values).toContain(0);
  });

  it('consulta documento no escopo da empresa e mapeia o DTO sem expor a chave storage', async () => {
    const documento = criarDocumentoPersistido({
      data_validade: new Date('2026-06-30T00:00:00.000Z'),
      anexo_tamanho_bytes: 482311n,
      anexo_url: 'chave-interna-de-storage',
    });
    prismaMock.documento.findFirst.mockResolvedValue(documento);

    const resultado = await service.obter(documento.id, empresaId);

    expect(prismaMock.documento.findFirst).toHaveBeenCalledWith({
      where: {
        id: documento.id,
        unidade: { is: { empresa_id: empresaId } },
      },
      select: expect.objectContaining({
        anexo_url: true,
        anexo_tamanho_bytes: true,
      }),
    });
    expect(resultado).toEqual({
      id: documento.id,
      unidadeId: unidadeId,
      unidadeNome: 'Unidade Norte',
      nome: 'Licença Ambiental',
      tipo: 'Licença',
      categoria: 'Ambiental',
      dataEmissao: '2026-06-01',
      dataValidade: '2026-06-30',
      descricao: 'Licença anual',
      statusValidade: 'proximo_vencimento',
      anexo: {
        nome: 'licenca.pdf',
        tamanhoBytes: 482311,
        tipo: 'application/pdf',
        url: `/api/v1/documentos/${documento.id}/anexo`,
      },
      criadoEm: '2026-06-10T10:00:00.000Z',
      atualizadoEm: '2026-06-11T11:00:00.000Z',
    });
    expect(resultado).not.toHaveProperty('anexo_url');
    expect(storageMock.read).not.toHaveBeenCalled();
  });

  it('retorna categorias distintas em ordem alfabética entre unidades da empresa', async () => {
    prismaMock.documento.groupBy.mockResolvedValue([
      { categoria: 'Ambiental' },
      { categoria: 'Legal' },
    ]);

    const categorias = await service.listarCategorias(empresaId);

    expect(categorias).toEqual(['Ambiental', 'Legal']);
    expect(prismaMock.documento.groupBy).toHaveBeenCalledWith({
      by: ['categoria'],
      where: {
        unidade: { is: { empresa_id: empresaId } },
      },
      orderBy: { categoria: 'asc' },
    });
  });

  it('remove categorias vazias ou compostas somente por espaços', async () => {
    prismaMock.documento.groupBy.mockResolvedValue([
      { categoria: '' },
      { categoria: '   ' },
      { categoria: '\t  ' },
      { categoria: 'Segurança' },
    ]);

    await expect(service.listarCategorias(empresaId)).resolves.toEqual([
      'Segurança',
    ]);
  });

  it('retorna array vazio quando a empresa não possui documentos', async () => {
    prismaMock.documento.groupBy.mockResolvedValue([]);

    await expect(service.listarCategorias(empresaId)).resolves.toEqual([]);
    expect(prismaMock.documento.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          unidade: { is: { empresa_id: empresaId } },
        },
      }),
    );
  });

  it.each(['documento inexistente', 'documento de outra empresa'])(
    'retorna 404 para %s na consulta individual',
    async () => {
      prismaMock.documento.findFirst.mockResolvedValue(null);

      await expect(
        service.obter('a0cd295f-5787-493b-a3d0-c85029a75fc8', empresaId),
      ).rejects.toMatchObject({
        response: {
          codigo: 'RECURSO_NAO_ENCONTRADO',
          message: 'Documento não encontrado.',
        },
        status: 404,
      });
      expect(storageMock.read).not.toHaveBeenCalled();
    },
  );

  it('mapeia o documento e o anexo ao DTO sem expor a chave interna', async () => {
    configurarResultados(1, [
      {
        ...criarDocumentoRow(),
        anexo_url: 'chave-interna-de-storage',
      },
    ]);

    const resultado = await service.listar(filtrosPadrao, empresaId);
    const documento = resultado.items[0];

    expect(documento).toEqual({
      id: 'a0cd295f-5787-493b-a3d0-c85029a75fc8',
      unidadeId,
      unidadeNome: 'Unidade Norte',
      nome: 'Licença Ambiental',
      tipo: 'Licença',
      categoria: 'Ambiental',
      dataEmissao: '2025-06-15',
      dataValidade: dataHoje,
      descricao: 'Licença anual',
      statusValidade: 'proximo_vencimento',
      anexo: {
        nome: 'licenca.pdf',
        tamanhoBytes: 482311,
        tipo: 'application/pdf',
        url: `/api/v1/documentos/a0cd295f-5787-493b-a3d0-c85029a75fc8/anexo`,
      },
      criadoEm: '2026-06-15T10:00:00.000Z',
      atualizadoEm: '2026-06-15T11:00:00.000Z',
    });
    expect(documento).not.toHaveProperty('anexo_url');
    expect(JSON.stringify(documento)).not.toContain('chave-interna-de-storage');
  });

  it('converte BigInt para number e mantém datas de negócio em YYYY-MM-DD', async () => {
    configurarResultados(1, [
      criarDocumentoRow({
        data_emissao: '2026-06-01',
        data_validade: '2026-06-30',
        anexo_tamanho_bytes: 9007199254740991n,
      }),
    ]);

    const resultado = await service.listar(filtrosPadrao, empresaId);
    const documento = resultado.items[0];

    expect(documento.anexo.tamanhoBytes).toBe(9007199254740991);
    expect(typeof documento.anexo.tamanhoBytes).toBe('number');
    expect(documento.dataEmissao).toBe('2026-06-01');
    expect(documento.dataValidade).toBe('2026-06-30');
  });

  it('cria documento e anexo usando a empresa, unidade e dados validados', async () => {
    configurarCriacao();

    const resultado = await service.criar(
      unidadeId,
      documentoParaCriar,
      anexoParaCriar,
      empresaId,
    );

    expect(prismaMock.unidade.findFirst).toHaveBeenCalledWith({
      where: { id: unidadeId, empresa_id: empresaId },
      select: { id: true, nome: true, status: true },
    });
    expect(storageMock.save).toHaveBeenCalledWith({
      buffer: anexoParaCriar.buffer,
      mimeType: 'application/pdf',
    });

    const args = prismaMock.documento.create.mock.calls[0][0] as {
      data: Record<string, unknown>;
      select: Record<string, unknown>;
    };
    expect(args.data).toEqual({
      unidade_id: unidadeId,
      nome: 'Licença Ambiental',
      tipo: 'Licença',
      categoria: 'Ambiental',
      data_emissao: new Date('2026-06-01T00:00:00.000Z'),
      data_validade: new Date('2026-06-30T00:00:00.000Z'),
      descricao: 'Licença anual',
      anexo_nome: 'licenca.pdf',
      anexo_url: 'storage-private-key',
      anexo_tamanho_bytes: BigInt(anexoParaCriar.buffer.byteLength),
      anexo_tipo: 'application/pdf',
    });

    expect(resultado).toEqual({
      id: 'a0cd295f-5787-493b-a3d0-c85029a75fc8',
      unidadeId,
      unidadeNome: 'Unidade Norte',
      nome: 'Licença Ambiental',
      tipo: 'Licença',
      categoria: 'Ambiental',
      dataEmissao: '2026-06-01',
      dataValidade: '2026-06-30',
      descricao: 'Licença anual',
      statusValidade: 'proximo_vencimento',
      anexo: {
        nome: 'licenca.pdf',
        tamanhoBytes: anexoParaCriar.buffer.byteLength,
        tipo: 'application/pdf',
        url: '/api/v1/documentos/a0cd295f-5787-493b-a3d0-c85029a75fc8/anexo',
      },
      criadoEm: '2026-06-15T10:00:00.000Z',
      atualizadoEm: '2026-06-15T11:00:00.000Z',
    });
    expect(JSON.stringify(resultado)).not.toContain('storage-private-key');
  });

  it.each(['unidade inexistente', 'unidade de outra empresa'])(
    'não permite criar em %s e não inicia o armazenamento',
    async () => {
      prismaMock.unidade.findFirst.mockResolvedValue(null);

      await expect(
        service.criar(unidadeId, documentoParaCriar, anexoParaCriar, empresaId),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prismaMock.unidade.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: unidadeId, empresa_id: empresaId },
        }),
      );
      expect(storageMock.save).not.toHaveBeenCalled();
      expect(prismaMock.documento.create).not.toHaveBeenCalled();
    },
  );

  it('rejeita unidade inativa com conflito antes de armazenar o arquivo', async () => {
    configurarCriacao('inativa');

    const erro = await service
      .criar(unidadeId, documentoParaCriar, anexoParaCriar, empresaId)
      .catch((error: unknown) => error);

    expect(erro).toBeInstanceOf(ConflictException);
    if (erro instanceof ConflictException) {
      expect(erro.getStatus()).toBe(409);
      expect(erro.getResponse()).toMatchObject({
        codigo: 'UNIDADE_INATIVA',
      });
    }
    expect(storageMock.save).not.toHaveBeenCalled();
    expect(prismaMock.documento.create).not.toHaveBeenCalled();
  });

  it('propaga falha do storage sem tentar persistir ou excluir arquivo', async () => {
    configurarCriacao();
    const erro = new Error('Storage indisponível');
    storageMock.save.mockRejectedValue(erro);

    await expect(
      service.criar(unidadeId, documentoParaCriar, anexoParaCriar, empresaId),
    ).rejects.toBe(erro);

    expect(prismaMock.documento.create).not.toHaveBeenCalled();
    expect(storageMock.delete).not.toHaveBeenCalled();
  });

  it('remove o anexo se a persistência Prisma falhar e preserva o erro original', async () => {
    configurarCriacao();
    const erroPersistencia = new Error('Falha ao criar documento');
    prismaMock.documento.create.mockRejectedValue(erroPersistencia);

    await expect(
      service.criar(unidadeId, documentoParaCriar, anexoParaCriar, empresaId),
    ).rejects.toBe(erroPersistencia);

    expect(storageMock.delete).toHaveBeenCalledWith('storage-private-key');
  });

  it('registra falha na compensação sem mascarar o erro de persistência', async () => {
    configurarCriacao();
    const erroPersistencia = new Error('Falha original no banco');
    const erroCompensacao = new Error('Falha ao remover anexo');
    prismaMock.documento.create.mockRejectedValue(erroPersistencia);
    storageMock.delete.mockRejectedValue(erroCompensacao);
    const loggerSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);

    await expect(
      service.criar(unidadeId, documentoParaCriar, anexoParaCriar, empresaId),
    ).rejects.toBe(erroPersistencia);

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining(unidadeId),
      expect.stringContaining('Falha ao remover anexo'),
    );
  });

  it('atualiza somente campos informados e preserva o anexo e os demais campos', async () => {
    configurarAtualizacao();
    const documento: AtualizarDocumentoDto = {
      nome: 'Licença revisada',
      categoria: 'Regulatório',
    };

    const resultado = await service.atualizar(
      'a0cd295f-5787-493b-a3d0-c85029a75fc8',
      documento,
      undefined,
      empresaId,
    );

    expect(prismaMock.documento.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'a0cd295f-5787-493b-a3d0-c85029a75fc8',
          unidade: { is: { empresa_id: empresaId } },
        },
      }),
    );
    expect(prismaMock.documento.update).toHaveBeenCalledTimes(1);
    const args = prismaMock.documento.update.mock.calls[0][0] as {
      where: Record<string, unknown>;
      data: Record<string, unknown>;
    };
    expect(args.where).toEqual({
      id: 'a0cd295f-5787-493b-a3d0-c85029a75fc8',
      unidade: { is: { empresa_id: empresaId } },
    });
    expect(args.data).toEqual({
      nome: 'Licença revisada',
      categoria: 'Regulatório',
      updated_at: new Date('2026-06-15T23:45:00.000Z'),
    });
    expect(args.data).not.toHaveProperty('unidade_id');
    expect(args.data).not.toHaveProperty('created_at');
    expect(storageMock.save).not.toHaveBeenCalled();
    expect(storageMock.delete).not.toHaveBeenCalled();
    expect(resultado).toMatchObject({
      nome: 'Licença revisada',
      categoria: 'Regulatório',
      tipo: 'Licença',
      dataEmissao: '2026-06-01',
      dataValidade: '2026-06-30',
      descricao: 'Licença anual',
      anexo: {
        nome: 'licenca.pdf',
        tamanhoBytes: 482311,
        tipo: 'application/pdf',
      },
    });
  });

  it('atualiza somente o anexo e remove o arquivo anterior após persistir', async () => {
    configurarAtualizacao();

    const resultado = await service.atualizar(
      'a0cd295f-5787-493b-a3d0-c85029a75fc8',
      {},
      anexoParaAtualizar,
      empresaId,
    );

    expect(storageMock.save).toHaveBeenCalledWith({
      buffer: anexoParaAtualizar.buffer,
      mimeType: 'application/pdf',
    });
    expect(prismaMock.documento.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          anexo_nome: 'licenca-atualizada.pdf',
          anexo_url: 'new-storage-key',
          anexo_tamanho_bytes: BigInt(anexoParaAtualizar.buffer.byteLength),
          anexo_tipo: 'application/pdf',
        }),
      }),
    );
    expect(
      prismaMock.documento.update.mock.invocationCallOrder[0],
    ).toBeLessThan(storageMock.delete.mock.invocationCallOrder[0]);
    expect(storageMock.delete).toHaveBeenCalledWith('old-storage-key');
    expect(resultado).toMatchObject({
      nome: 'Licença Ambiental',
      dataEmissao: '2026-06-01',
      dataValidade: '2026-06-30',
      anexo: {
        nome: 'licenca-atualizada.pdf',
        tamanhoBytes: anexoParaAtualizar.buffer.byteLength,
        tipo: 'application/pdf',
      },
    });
  });

  it('atualiza campos e anexo juntos sem alterar a unidade nem expor a chave', async () => {
    configurarAtualizacao();

    const resultado = await service.atualizar(
      'a0cd295f-5787-493b-a3d0-c85029a75fc8',
      { nome: 'Licença atualizada', descricao: 'Nova descrição' },
      anexoParaAtualizar,
      empresaId,
    );

    const args = prismaMock.documento.update.mock.calls[0][0] as {
      data: Record<string, unknown>;
    };
    expect(args.data).toMatchObject({
      nome: 'Licença atualizada',
      descricao: 'Nova descrição',
      anexo_url: 'new-storage-key',
    });
    expect(args.data).not.toHaveProperty('unidade_id');
    expect(resultado.nome).toBe('Licença atualizada');
    expect(JSON.stringify(resultado)).not.toContain('new-storage-key');
    expect(JSON.stringify(resultado)).not.toContain('old-storage-key');
  });

  it('preserva dataEmissao quando não informada e valida a validade nova contra ela', async () => {
    configurarAtualizacao();

    const resultado = await service.atualizar(
      'a0cd295f-5787-493b-a3d0-c85029a75fc8',
      { dataValidade: '2026-06-05' },
      undefined,
      empresaId,
    );

    const args = prismaMock.documento.update.mock.calls[0][0] as {
      data: Record<string, unknown>;
    };
    expect(args.data).toMatchObject({
      data_validade: new Date('2026-06-05T00:00:00.000Z'),
    });
    expect(args.data).not.toHaveProperty('data_emissao');
    expect(resultado.dataEmissao).toBe('2026-06-01');
    expect(resultado.dataValidade).toBe('2026-06-05');
  });

  it('preserva dataEmissao explicitamente normalizada como ausente', async () => {
    configurarAtualizacao();

    const resultado = await service.atualizar(
      'a0cd295f-5787-493b-a3d0-c85029a75fc8',
      { dataEmissao: undefined, categoria: 'Legal' },
      undefined,
      empresaId,
    );

    const args = prismaMock.documento.update.mock.calls[0][0] as {
      data: Record<string, unknown>;
    };
    expect(args.data).not.toHaveProperty('data_emissao');
    expect(resultado.dataEmissao).toBe('2026-06-01');
  });

  it('valida a dataEmissao informada contra a dataValidade persistida', async () => {
    configurarAtualizacao();

    await service.atualizar(
      'a0cd295f-5787-493b-a3d0-c85029a75fc8',
      { dataEmissao: '2026-06-20' },
      undefined,
      empresaId,
    );

    const args = prismaMock.documento.update.mock.calls[0][0] as {
      data: Record<string, unknown>;
    };
    expect(args.data).toMatchObject({
      data_emissao: new Date('2026-06-20T00:00:00.000Z'),
    });
  });

  it('rejeita dataEmissao posterior à dataValidade final antes de salvar arquivo', async () => {
    configurarAtualizacao();

    await expect(
      service.atualizar(
        'a0cd295f-5787-493b-a3d0-c85029a75fc8',
        { dataEmissao: '2026-07-01' },
        anexoParaAtualizar,
        empresaId,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(storageMock.save).not.toHaveBeenCalled();
    expect(prismaMock.documento.update).not.toHaveBeenCalled();
  });

  it('rejeita nova validade anterior à dataEmissao persistida', async () => {
    configurarAtualizacao();

    await expect(
      service.atualizar(
        'a0cd295f-5787-493b-a3d0-c85029a75fc8',
        { dataValidade: '2026-05-31' },
        undefined,
        empresaId,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prismaMock.documento.update).not.toHaveBeenCalled();
  });

  it.each(['documento inexistente', 'documento de outra empresa'])(
    'retorna 404 sem revelar %s',
    async () => {
      prismaMock.documento.findFirst.mockResolvedValue(null);

      await expect(
        service.atualizar(
          'a0cd295f-5787-493b-a3d0-c85029a75fc8',
          { nome: 'Atualizado' },
          undefined,
          empresaId,
        ),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prismaMock.documento.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 'a0cd295f-5787-493b-a3d0-c85029a75fc8',
            unidade: { is: { empresa_id: empresaId } },
          },
        }),
      );
      expect(prismaMock.documento.update).not.toHaveBeenCalled();
    },
  );

  it('rejeita payload efetivamente vazio sem consultar ou atualizar o documento', async () => {
    await expect(
      service.atualizar(
        'a0cd295f-5787-493b-a3d0-c85029a75fc8',
        { dataEmissao: undefined },
        undefined,
        empresaId,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prismaMock.documento.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.documento.update).not.toHaveBeenCalled();
  });

  it('propaga falha ao salvar o novo anexo sem atualizar ou limpar arquivos', async () => {
    configurarAtualizacao();
    const erro = new Error('Storage indisponível');
    storageMock.save.mockRejectedValue(erro);

    await expect(
      service.atualizar(
        'a0cd295f-5787-493b-a3d0-c85029a75fc8',
        {},
        anexoParaAtualizar,
        empresaId,
      ),
    ).rejects.toBe(erro);

    expect(prismaMock.documento.update).not.toHaveBeenCalled();
    expect(storageMock.delete).not.toHaveBeenCalled();
  });

  it('remove o novo anexo se a atualização Prisma falhar e preserva o anterior', async () => {
    configurarAtualizacao();
    const erroPersistencia = new Error('Falha ao atualizar documento');
    prismaMock.documento.update.mockRejectedValue(erroPersistencia);

    await expect(
      service.atualizar(
        'a0cd295f-5787-493b-a3d0-c85029a75fc8',
        { nome: 'Nome atualizado' },
        anexoParaAtualizar,
        empresaId,
      ),
    ).rejects.toBe(erroPersistencia);

    expect(storageMock.delete).toHaveBeenCalledTimes(1);
    expect(storageMock.delete).toHaveBeenCalledWith('new-storage-key');
  });

  it('registra falha na compensação e preserva o erro original do Prisma', async () => {
    configurarAtualizacao();
    const erroPersistencia = new Error('Erro original do Prisma');
    const erroCompensacao = new Error('Falha ao remover novo anexo');
    prismaMock.documento.update.mockRejectedValue(erroPersistencia);
    storageMock.delete.mockRejectedValue(erroCompensacao);
    const loggerSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);

    await expect(
      service.atualizar(
        'a0cd295f-5787-493b-a3d0-c85029a75fc8',
        {},
        anexoParaAtualizar,
        empresaId,
      ),
    ).rejects.toBe(erroPersistencia);

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('a0cd295f-5787-493b-a3d0-c85029a75fc8'),
      expect.stringContaining('Falha ao remover novo anexo'),
    );
  });

  it('registra erro ao limpar anexo anterior e mantém sucesso do update', async () => {
    configurarAtualizacao();
    const erroLimpeza = new Error('Falha ao remover anexo anterior');
    storageMock.delete.mockRejectedValue(erroLimpeza);
    const loggerSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);

    const resultado = await service.atualizar(
      'a0cd295f-5787-493b-a3d0-c85029a75fc8',
      {},
      anexoParaAtualizar,
      empresaId,
    );

    expect(resultado.id).toBe('a0cd295f-5787-493b-a3d0-c85029a75fc8');
    expect(storageMock.delete).toHaveBeenCalledWith('old-storage-key');
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('a0cd295f-5787-493b-a3d0-c85029a75fc8'),
      expect.stringContaining('Falha ao remover anexo anterior'),
    );
  });

  it('recalcula status, mantém datas de negócio e atualiza o timestamp', async () => {
    configurarAtualizacao();

    const resultado = await service.atualizar(
      'a0cd295f-5787-493b-a3d0-c85029a75fc8',
      { categoria: 'Legal' },
      undefined,
      empresaId,
    );

    const args = prismaMock.documento.update.mock.calls[0][0] as {
      data: Record<string, unknown>;
    };
    expect(args.data.updated_at).toEqual(new Date('2026-06-15T23:45:00.000Z'));
    expect(resultado).toMatchObject({
      dataEmissao: '2026-06-01',
      dataValidade: '2026-06-30',
      statusValidade: 'proximo_vencimento',
      criadoEm: '2026-06-10T10:00:00.000Z',
      atualizadoEm: '2026-06-15T23:45:00.000Z',
    });
  });

  it('baixa o anexo por chave interna sem filtrar a unidade por status', async () => {
    configurarAtualizacao();
    const buffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x00, 0xff]);
    storageMock.read.mockResolvedValue({
      buffer,
      mimeType: 'application/pdf',
      size: buffer.byteLength,
    });

    await expect(
      service.baixarAnexo('a0cd295f-5787-493b-a3d0-c85029a75fc8', empresaId),
    ).resolves.toEqual({
      buffer,
      mimeType: 'application/pdf',
      size: buffer.byteLength,
      fileName: 'licenca.pdf',
    });

    expect(prismaMock.documento.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'a0cd295f-5787-493b-a3d0-c85029a75fc8',
        unidade: { is: { empresa_id: empresaId } },
      },
      select: { anexo_url: true, anexo_nome: true },
    });
    expect(storageMock.read).toHaveBeenCalledWith('old-storage-key');
  });

  it.each(['documento inexistente', 'documento de outra empresa'])(
    'não permite baixar %s',
    async () => {
      prismaMock.documento.findFirst.mockResolvedValue(null);

      await expect(
        service.baixarAnexo('a0cd295f-5787-493b-a3d0-c85029a75fc8', empresaId),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(storageMock.read).not.toHaveBeenCalled();
    },
  );

  it('registra e propaga falha de leitura do armazenamento', async () => {
    configurarAtualizacao();
    const erro = new Error('Storage indisponível');
    storageMock.read.mockRejectedValue(erro);
    const loggerSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);

    await expect(
      service.baixarAnexo('a0cd295f-5787-493b-a3d0-c85029a75fc8', empresaId),
    ).rejects.toBe(erro);

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining('a0cd295f-5787-493b-a3d0-c85029a75fc8'),
      expect.stringContaining('Storage indisponível'),
    );
  });

  it('valida o anexo e exclui o registro antes do arquivo no escopo da empresa', async () => {
    configurarAtualizacao();

    await expect(
      service.excluir('a0cd295f-5787-493b-a3d0-c85029a75fc8', empresaId),
    ).resolves.toBeUndefined();

    expect(prismaMock.documento.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'a0cd295f-5787-493b-a3d0-c85029a75fc8',
          unidade: { is: { empresa_id: empresaId } },
        },
      }),
    );
    expect(prismaMock.documento.delete).toHaveBeenCalledWith({
      where: {
        id: 'a0cd295f-5787-493b-a3d0-c85029a75fc8',
        unidade: { is: { empresa_id: empresaId } },
      },
    });
    expect(storageMock.read).toHaveBeenCalledWith('old-storage-key');
    expect(storageMock.delete).toHaveBeenCalledWith('old-storage-key');
    expect(
      prismaMock.documento.delete.mock.invocationCallOrder[0],
    ).toBeLessThan(storageMock.delete.mock.invocationCallOrder[0]);
  });

  it.each(['documento inexistente', 'documento de outra empresa'])(
    'não exclui arquivo nem registro para %s',
    async () => {
      prismaMock.documento.findFirst.mockResolvedValue(null);

      await expect(
        service.excluir('a0cd295f-5787-493b-a3d0-c85029a75fc8', empresaId),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prismaMock.documento.delete).not.toHaveBeenCalled();
      expect(storageMock.read).not.toHaveBeenCalled();
      expect(storageMock.delete).not.toHaveBeenCalled();
    },
  );

  it('mantém o arquivo quando a exclusão do registro no Prisma falha', async () => {
    configurarAtualizacao();
    const erro = new Error('Falha ao excluir registro');
    prismaMock.documento.delete.mockRejectedValue(erro);

    await expect(
      service.excluir('a0cd295f-5787-493b-a3d0-c85029a75fc8', empresaId),
    ).rejects.toBe(erro);

    expect(storageMock.read).toHaveBeenCalledWith('old-storage-key');
    expect(storageMock.delete).not.toHaveBeenCalled();
    expect(prismaMock.documento.create).not.toHaveBeenCalled();
  });

  it('não restaura o registro quando o anexo já está ausente no storage', async () => {
    configurarAtualizacao();
    storageMock.delete.mockRejectedValue(
      new NotFoundException('Stored file not found.'),
    );

    await expect(
      service.excluir('a0cd295f-5787-493b-a3d0-c85029a75fc8', empresaId),
    ).resolves.toBeUndefined();

    expect(storageMock.read).toHaveBeenCalledWith('old-storage-key');
    expect(prismaMock.documento.delete).toHaveBeenCalled();
    expect(prismaMock.documento.create).not.toHaveBeenCalled();
  });

  it('restaura os dados originais do registro se a exclusão do armazenamento falhar', async () => {
    const documento = criarDocumentoPersistido();
    configurarAtualizacao(documento);
    let registroPresente = true;
    prismaMock.documento.delete.mockImplementation(async () => {
      registroPresente = false;
      return { id: documento.id };
    });
    prismaMock.documento.create.mockImplementation(async () => {
      registroPresente = true;
      return {
        id: documento.id,
        created_at: documento.created_at,
        updated_at: documento.updated_at,
      };
    });
    const erroStorage = new Error('Falha ao remover arquivo');
    storageMock.delete.mockRejectedValueOnce(erroStorage);

    await expect(service.excluir(documento.id, empresaId)).rejects.toBe(
      erroStorage,
    );

    expect(registroPresente).toBe(true);
    expect(prismaMock.documento.create).toHaveBeenCalledWith({
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
    expect(storageMock.read).toHaveBeenCalledWith(documento.anexo_url);
    expect(storageMock.save).not.toHaveBeenCalled();
    expect(storageMock.delete).toHaveBeenCalledTimes(1);
    expect(storageMock.delete).toHaveBeenCalledWith(documento.anexo_url);
  });

  it('registra falha ao restaurar o registro sem mascarar a falha do storage', async () => {
    const documento = criarDocumentoPersistido();
    configurarAtualizacao(documento);
    let registroPresente = true;
    prismaMock.documento.delete.mockImplementation(async () => {
      registroPresente = false;
      return { id: documento.id };
    });
    const erroStorage = new Error('Falha ao remover arquivo');
    const erroRestauracao = new Error('Falha ao restaurar registro no Prisma');
    storageMock.delete.mockRejectedValue(erroStorage);
    prismaMock.documento.create.mockRejectedValue(erroRestauracao);
    const loggerSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);

    await expect(service.excluir(documento.id, empresaId)).rejects.toBe(
      erroStorage,
    );

    expect(registroPresente).toBe(false);
    expect(prismaMock.documento.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          id: documento.id,
          anexo_url: documento.anexo_url,
        }),
      }),
    );
    expect(storageMock.save).not.toHaveBeenCalled();
    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining(documento.id),
      expect.stringContaining('Falha ao restaurar registro no Prisma'),
    );
  });
});
