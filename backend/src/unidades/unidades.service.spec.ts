import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { UnidadesService } from './unidades.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UnidadesService', () => {
  const prismaMock = {
    $queryRaw: jest.fn<(query: unknown) => Promise<unknown[]>>(),
    unidade: {
      findMany: jest.fn<() => Promise<unknown[]>>(),
      count: jest.fn<() => Promise<number>>(),
    },
  };

  it('deve ajustar a página solicitada para a última página existente', async () => {
    prismaMock.unidade.count.mockResolvedValue(45);
    prismaMock.unidade.findMany.mockResolvedValue([]);

    const resultado = await service.listar(
      {
        page: 99,
        pageSize: 20,
      },
      'empresa-123',
    );

    expect(resultado).toEqual({
      items: [],
      page: 3,
      pageSize: 20,
      total: 45,
      totalPages: 3,
    });

    expect(prismaMock.unidade.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 40,
        take: 20,
      }),
    );
  });

  it('deve retornar uma página válida quando não houver unidades', async () => {
    prismaMock.unidade.count.mockResolvedValue(0);
    prismaMock.unidade.findMany.mockResolvedValue([]);

    const resultado = await service.listar(
      {
        page: 5,
        pageSize: 20,
      },
      'empresa-123',
    );

    expect(resultado).toEqual({
      items: [],
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 1,
    });

    expect(prismaMock.unidade.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 20,
      }),
    );
  });

  it('deve ordenar as unidades pelo nome em ordem crescente', async () => {
    prismaMock.unidade.count.mockResolvedValue(2);
    prismaMock.unidade.findMany.mockResolvedValue([]);

    await service.listar(
      {
        page: 1,
        pageSize: 20,
      },
      'empresa-123',
    );

    expect(prismaMock.unidade.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [
          { nome: 'asc' },
          { id: 'asc' },
        ],
      }),
    );
  });

  it('deve combinar o filtro de status com o empresa_id', async () => {
    prismaMock.unidade.count.mockResolvedValue(5);
    prismaMock.unidade.findMany.mockResolvedValue([]);

    await service.listar(
      {
        page: 1,
        pageSize: 20,
        status: 'inativa',
      },
      'empresa-123',
    );

    expect(prismaMock.unidade.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          empresa_id: 'empresa-123',
          status: 'inativa',
        },
      }),
    );

    expect(prismaMock.unidade.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          empresa_id: 'empresa-123',
          status: 'inativa',
        },
      }),
    );
  });

  let service: UnidadesService;

  beforeEach(() => {
    jest.clearAllMocks();

    service = new UnidadesService(prismaMock as unknown as PrismaService);
  });

  it('deve utilizar consultas SQL quando houver busca', async () => {
    prismaMock.$queryRaw.mockResolvedValue([]);

    await service.listar(
      {
        page: 1,
        pageSize: 20,
        q: 'Matriz',
      },
      'empresa-123',
    );

    expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(2);

    const consultas = prismaMock.$queryRaw.mock.calls;

    const consultaContagem = consultas[0][0] as {
      values: unknown[];
      strings: string[];
    };

    expect(consultaContagem.values).toEqual([
      'empresa-123',
      '%Matriz%',
      '%Matriz%',
    ]);
    expect(consultaContagem.strings.join('')).toContain(
      'unaccent(lower(u.nome))',
    );
    expect(consultaContagem.strings.join('')).toContain(
      'unaccent(lower(u.codigo))',
    );
  });

  it('deve aplicar status e empresa nas duas consultas SQL', async () => {
    prismaMock.$queryRaw
      .mockResolvedValueOnce([{ total: 1 }])
      .mockResolvedValueOnce([]);

    await service.listar(
      {
        page: 1,
        pageSize: 20,
        q: 'São',
        status: 'ativa',
      },
      'empresa-123',
    );

    for (const chamada of prismaMock.$queryRaw.mock.calls) {
      const consulta = chamada[0] as {
        values: unknown[];
        strings: string[];
      };
      expect(consulta.strings.join('')).toContain('u.empresa_id');
      expect(consulta.strings.join('')).toContain('u.status');
    }

    const consultaContagem = prismaMock.$queryRaw.mock.calls[0][0] as {
      values: unknown[];
    };
    expect(consultaContagem.values).toEqual([
      'empresa-123',
      'ativa',
      '%São%',
      '%São%',
    ]);

    const consultaRegistros = prismaMock.$queryRaw.mock.calls[1][0] as {
      values: unknown[];
      strings: string[];
    };
    expect(consultaRegistros.values).toEqual([
      'empresa-123',
      'ativa',
      '%São%',
      '%São%',
      20,
      0,
    ]);
  });

  it('deve escapar caracteres curinga da busca como parâmetros', async () => {
    prismaMock.$queryRaw.mockResolvedValue([]);

    await service.listar(
      { page: 1, pageSize: 20, q: '100%_A\\B' },
      'empresa-123',
    );

    const consulta = prismaMock.$queryRaw.mock.calls[0][0] as {
      values: unknown[];
    };
    expect(consulta.values).toContain('%100\\%\\_A\\\\B%');
  });

  it('deve filtrar unidades pelo empresa_id do usuário autenticado', async () => {
    prismaMock.unidade.findMany.mockResolvedValue([]);
    prismaMock.unidade.count.mockResolvedValue(0);

    await service.listar(
      {
        page: 1,
        pageSize: 20,
      },
      'empresa-123',
    );

    expect(prismaMock.unidade.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          empresa_id: 'empresa-123',
        }),
      }),
    );

    expect(prismaMock.unidade.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          empresa_id: 'empresa-123',
        }),
      }),
    );
  });

  it('deve retornar o contrato completo com endereço e totais', async () => {
    prismaMock.unidade.count.mockResolvedValue(1);
    prismaMock.unidade.findMany.mockResolvedValue([
      {
        id: 'unidade-1',
        nome: 'Matriz',
        codigo: 'MAT',
        status: 'ativa',
        cep: '01001000',
        logradouro: 'Praça da Sé',
        numero: '100',
        complemento: null,
        bairro: 'Sé',
        cidade: 'São Paulo',
        uf: 'SP',
        descricao: 'Matriz principal',
        created_at: new Date('2026-01-10T12:00:00.000Z'),
        updated_at: new Date('2026-02-10T12:00:00.000Z'),
        _count: { documento: 25, tarefa: 32 },
      },
    ]);

    const resultado = await service.listar(
      { page: 1, pageSize: 20 },
      'empresa-123',
    );

    expect(resultado.items).toEqual([
      {
        id: 'unidade-1',
        nome: 'Matriz',
        codigo: 'MAT',
        status: 'ativa',
        endereco: {
          cep: '01001000',
          logradouro: 'Praça da Sé',
          numero: '100',
          complemento: undefined,
          bairro: 'Sé',
          cidade: 'São Paulo',
          uf: 'SP',
        },
        descricao: 'Matriz principal',
        criadoEm: '2026-01-10T12:00:00.000Z',
        atualizadoEm: '2026-02-10T12:00:00.000Z',
        totalDocumentos: 25,
        totalTarefas: 32,
      },
    ]);
  });
});
