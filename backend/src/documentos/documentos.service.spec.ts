import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { PrismaService } from '../prisma/prisma.service';
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
};

let service: DocumentosService;

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
    service = new DocumentosService(prismaMock as unknown as PrismaService);
  });

  afterEach(() => {
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
});
