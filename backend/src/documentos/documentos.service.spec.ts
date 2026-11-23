import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { AnexoUploadFile } from './pipes/anexo-validation.pipe';
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
    create:
      jest.fn<
        (
          args: unknown,
        ) => Promise<{ id: string; created_at: Date; updated_at: Date }>
      >(),
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
});
