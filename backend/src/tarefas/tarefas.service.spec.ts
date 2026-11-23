import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import {
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TarefasService } from './tarefas.service';
import type { CriarTarefaDto } from './schemas/criar-tarefa.schema';

interface TarefaPersistida {
  id: string;
  unidade_id: string;
  unidade: { nome: string; status?: string };
  titulo: string;
  descricao: string | null;
  status: string;
  data_inicio: Date;
  prazo: Date;
  data_conclusao: Date | null;
  created_at: Date;
  updated_at: Date;
}

const empresaId = 'c3c4a4b7-14ba-4204-a341-7896853621b4';
const unidadeId = 'd9428888-122b-4b42-9acc-2a83c47b3f6e';
const tarefaId = 'a0cd295f-5787-493b-a3d0-c85029a75fc8';

const tarefaParaCriar: CriarTarefaDto = {
  titulo: 'Revisar documentação',
  descricao: 'Conferir documentos da unidade',
  prazoFinal: '2026-06-30',
};

const agora = new Date('2026-06-15T10:00:00.000Z');

function criarTarefaPersistida(
  overrides: Partial<TarefaPersistida> = {},
): TarefaPersistida {
  return {
    id: tarefaId,
    unidade_id: unidadeId,
    unidade: { nome: 'Unidade Norte', status: 'ativa' },
    titulo: 'Revisar documentação',
    descricao: 'Conferir documentos da unidade',
    status: 'pendente',
    data_inicio: new Date('2026-06-15T00:00:00.000Z'),
    prazo: new Date('2026-06-30T00:00:00.000Z'),
    data_conclusao: null,
    created_at: agora,
    updated_at: agora,
    ...overrides,
  };
}

const txMock = {
  tarefa: {
    update: jest.fn<(args: unknown) => Promise<TarefaPersistida>>(),
  },
  unidade: {
    update: jest.fn<(args: unknown) => Promise<unknown>>(),
  },
};

const prismaMock = {
  $queryRaw: jest.fn<(query: unknown) => Promise<unknown[]>>(),
  $transaction:
    jest.fn<
      (
        callback: (tx: typeof txMock) => Promise<TarefaPersistida>,
      ) => Promise<TarefaPersistida>
    >(),
  unidade: {
    findFirst:
      jest.fn<
        (
          args: unknown,
        ) => Promise<{ id: string; nome: string; status: string } | null>
      >(),
  },
  tarefa: {
    create: jest.fn<(args: unknown) => Promise<TarefaPersistida>>(),
    findFirst: jest.fn<(args: unknown) => Promise<TarefaPersistida | null>>(),
    update: jest.fn<(args: unknown) => Promise<TarefaPersistida>>(),
    delete: jest.fn<(args: unknown) => Promise<{ id: string }>>(),
  },
};

let service: TarefasService;

describe('TarefasService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(agora);

    prismaMock.$queryRaw.mockReset();
    prismaMock.$transaction.mockReset();
    prismaMock.unidade.findFirst.mockReset();
    prismaMock.tarefa.create.mockReset();
    prismaMock.tarefa.findFirst.mockReset();
    prismaMock.tarefa.update.mockReset();
    prismaMock.tarefa.delete.mockReset();
    txMock.tarefa.update.mockReset();
    txMock.unidade.update.mockReset();

    service = new TarefasService(prismaMock as unknown as PrismaService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('cria tarefa pendente com data de início definida pelo servidor', async () => {
    prismaMock.unidade.findFirst.mockResolvedValue({
      id: unidadeId,
      nome: 'Unidade Norte',
      status: 'ativa',
    });
    prismaMock.tarefa.create.mockResolvedValue(criarTarefaPersistida());

    const resultado = await service.criar(
      unidadeId,
      tarefaParaCriar,
      empresaId,
    );

    expect(prismaMock.unidade.findFirst).toHaveBeenCalledWith({
      where: { id: unidadeId, empresa_id: empresaId },
      select: { id: true, nome: true, status: true },
    });
    expect(prismaMock.tarefa.create).toHaveBeenCalledWith({
      data: {
        unidade_id: unidadeId,
        titulo: tarefaParaCriar.titulo,
        descricao: tarefaParaCriar.descricao,
        status: 'pendente',
        data_inicio: new Date('2026-06-15T00:00:00.000Z'),
        prazo: new Date('2026-06-30T00:00:00.000Z'),
      },
      include: { unidade: { select: { nome: true } } },
    });
    expect(resultado.status).toBe('pendente');
    expect(resultado.dataInicio).toBe('2026-06-15');
    expect(resultado.prazoFinal).toBe('2026-06-30');
  });

  it('retorna 404 ao criar tarefa em unidade inexistente ou de outra empresa', async () => {
    prismaMock.unidade.findFirst.mockResolvedValue(null);

    await expect(
      service.criar(unidadeId, tarefaParaCriar, empresaId),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(prismaMock.tarefa.create).not.toHaveBeenCalled();
  });

  it('bloqueia criação em unidade inativa com código UNIDADE_INATIVA', async () => {
    prismaMock.unidade.findFirst.mockResolvedValue({
      id: unidadeId,
      nome: 'Unidade Norte',
      status: 'inativa',
    });

    await expect(
      service.criar(unidadeId, tarefaParaCriar, empresaId),
    ).rejects.toMatchObject({
      response: {
        codigo: 'UNIDADE_INATIVA',
      },
      status: 409,
    });

    expect(prismaMock.tarefa.create).not.toHaveBeenCalled();
  });

  it('consulta tarefa sempre dentro do escopo da empresa autenticada', async () => {
    const tarefa = criarTarefaPersistida();
    prismaMock.tarefa.findFirst.mockResolvedValue(tarefa);

    const resultado = await service.obter(tarefaId, empresaId);

    expect(prismaMock.tarefa.findFirst).toHaveBeenCalledWith({
      where: {
        id: tarefaId,
        unidade: { is: { empresa_id: empresaId } },
      },
      include: { unidade: { select: { nome: true } } },
    });
    expect(resultado.id).toBe(tarefaId);
  });

  it('retorna 404 para tarefa inexistente ou pertencente a outra empresa', async () => {
    prismaMock.tarefa.findFirst.mockResolvedValue(null);

    await expect(service.obter(tarefaId, empresaId)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('atualiza somente os campos enviados e preserva o status', async () => {
    const atual = criarTarefaPersistida();
    prismaMock.tarefa.findFirst.mockResolvedValue(atual);
    prismaMock.tarefa.update.mockResolvedValue({
      ...atual,
      titulo: 'Documentação revisada',
    });

    await service.atualizar(
      tarefaId,
      { titulo: 'Documentação revisada' },
      empresaId,
    );

    expect(prismaMock.tarefa.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: tarefaId },
        data: expect.objectContaining({
          titulo: 'Documentação revisada',
          updated_at: agora,
        }),
      }),
    );
    const chamada = prismaMock.tarefa.update.mock.calls[0][0] as {
      data: Record<string, unknown>;
    };
    expect(chamada.data).not.toHaveProperty('status');
    expect(chamada.data).not.toHaveProperty('unidade_id');
  });

  it('rejeita novo prazo anterior a hoje quando a data foi alterada', async () => {
    prismaMock.tarefa.findFirst.mockResolvedValue(criarTarefaPersistida());

    await expect(
      service.atualizar(tarefaId, { prazoFinal: '2026-06-14' }, empresaId),
    ).rejects.toMatchObject({
      response: { campo: 'prazoFinal' },
      status: 400,
    });

    expect(prismaMock.tarefa.update).not.toHaveBeenCalled();
  });

  it('bloqueia edição quando a unidade está inativa', async () => {
    prismaMock.tarefa.findFirst.mockResolvedValue(
      criarTarefaPersistida({
        unidade: { nome: 'Unidade Norte', status: 'inativa' },
      }),
    );

    await expect(
      service.atualizar(tarefaId, { titulo: 'Novo título' }, empresaId),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(prismaMock.tarefa.update).not.toHaveBeenCalled();
  });

  it('conclui tarefa e atualiza a unidade na mesma transação', async () => {
    const atual = criarTarefaPersistida();
    const concluida = criarTarefaPersistida({
      status: 'concluida',
      data_conclusao: agora,
    });

    prismaMock.tarefa.findFirst.mockResolvedValue(atual);
    txMock.tarefa.update.mockResolvedValue(concluida);
    txMock.unidade.update.mockResolvedValue({});
    prismaMock.$transaction.mockImplementation(async (callback) =>
      callback(txMock),
    );

    const resultado = await service.atualizarStatus(
      tarefaId,
      { status: 'concluida', confirmacao: true },
      empresaId,
    );

    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(txMock.tarefa.update).toHaveBeenCalledWith({
      where: { id: tarefaId },
      data: {
        status: 'concluida',
        data_conclusao: agora,
        updated_at: agora,
      },
      include: { unidade: { select: { nome: true } } },
    });
    expect(txMock.unidade.update).toHaveBeenCalledWith({
      where: { id: unidadeId },
      data: { updated_at: agora },
    });
    expect(resultado.status).toBe('concluida');
    expect(resultado.dataConclusao).toBe(agora.toISOString());
  });

  it('limpa data de conclusão ao retirar tarefa do status concluída', async () => {
    const atual = criarTarefaPersistida({
      status: 'concluida',
      data_conclusao: new Date('2026-06-14T12:00:00.000Z'),
    });
    const reaberta = criarTarefaPersistida();

    prismaMock.tarefa.findFirst.mockResolvedValue(atual);
    txMock.tarefa.update.mockResolvedValue(reaberta);
    txMock.unidade.update.mockResolvedValue({});
    prismaMock.$transaction.mockImplementation(async (callback) =>
      callback(txMock),
    );

    await service.atualizarStatus(
      tarefaId,
      { status: 'em_andamento' },
      empresaId,
    );

    expect(txMock.tarefa.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'em_andamento',
          data_conclusao: null,
        }),
      }),
    );
  });

  it('não executa transação quando o status solicitado já é o atual', async () => {
    const atual = criarTarefaPersistida();
    prismaMock.tarefa.findFirst.mockResolvedValue(atual);

    await service.atualizarStatus(tarefaId, { status: 'pendente' }, empresaId);

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('bloqueia mudança de status em unidade inativa', async () => {
    prismaMock.tarefa.findFirst.mockResolvedValue(
      criarTarefaPersistida({
        unidade: { nome: 'Unidade Norte', status: 'inativa' },
      }),
    );

    await expect(
      service.atualizarStatus(tarefaId, { status: 'em_andamento' }, empresaId),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('exclui tarefa dentro do escopo da empresa', async () => {
    prismaMock.tarefa.findFirst.mockResolvedValue(criarTarefaPersistida());
    prismaMock.tarefa.delete.mockResolvedValue({ id: tarefaId });

    await expect(service.excluir(tarefaId, empresaId)).resolves.toBeUndefined();

    expect(prismaMock.tarefa.findFirst).toHaveBeenCalledWith({
      where: {
        id: tarefaId,
        unidade: { is: { empresa_id: empresaId } },
      },
      select: { id: true },
    });
    expect(prismaMock.tarefa.delete).toHaveBeenCalledWith({
      where: { id: tarefaId },
    });
  });

  it('retorna 404 ao tentar excluir tarefa de outra empresa', async () => {
    prismaMock.tarefa.findFirst.mockResolvedValue(null);

    await expect(service.excluir(tarefaId, empresaId)).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(prismaMock.tarefa.delete).not.toHaveBeenCalled();
  });

  it('aplica escopo da empresa, busca, status e paginação na listagem', async () => {
    prismaMock.$queryRaw
      .mockResolvedValueOnce([{ total: 0 }])
      .mockResolvedValueOnce([]);

    const resultado = await service.listar(
      {
        q: 'Revisão',
        status: 'pendente',
        unidadeId,
        page: 2,
        pageSize: 10,
      },
      empresaId,
    );

    expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(2);

    const consultas = prismaMock.$queryRaw.mock.calls.map(
      ([query]) => query as { strings: string[]; values: unknown[] },
    );

    for (const consulta of consultas) {
      expect(consulta.strings.join('')).toContain('u.empresa_id = ');
      expect(consulta.strings.join('')).toContain('u.id = ');
      expect(consulta.values).toContain(empresaId);
      expect(consulta.values).toContain(unidadeId);
      expect(consulta.values).toContain('pendente');
    }

    expect(resultado).toEqual({
      items: [],
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 1,
    });
  });

  it('ordena a listagem por prazo e ID para manter resultado estável', async () => {
    prismaMock.$queryRaw
      .mockResolvedValueOnce([{ total: 0 }])
      .mockResolvedValueOnce([]);

    await service.listar({ page: 1, pageSize: 20 }, empresaId);

    const consulta = prismaMock.$queryRaw.mock.calls[1][0] as {
      strings: string[];
    };

    expect(consulta.strings.join('')).toContain(
      'ORDER BY t.prazo ASC, t.id ASC',
    );
  });
});
