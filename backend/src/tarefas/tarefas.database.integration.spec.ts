import { randomInt, randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { TarefasService } from './tarefas.service';

const empresas = { a: randomUUID(), b: randomUUID() };
const unidades = { a: randomUUID(), b: randomUUID() };
const tarefas = {
  aPrincipal: randomUUID(),
  aOutra: randomUUID(),
  bPrincipal: randomUUID(),
  inexistente: randomUUID(),
};

const idsCriados = {
  empresas: [] as string[],
  unidades: [] as string[],
  tarefas: [] as string[],
};

let testingModule: TestingModule | undefined;
let prisma: PrismaService | undefined;
let service: TarefasService;
let databaseConnected = false;

function validarDatabaseUrl(databaseUrl: string | undefined): string {
  if (!databaseUrl?.trim()) {
    throw new Error('DATABASE_URL deve estar definida para os testes.');
  }

  let url: URL;
  try {
    url = new URL(databaseUrl.trim());
  } catch {
    throw new Error('DATABASE_URL deve ser uma URL PostgreSQL válida.');
  }

  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    throw new Error('DATABASE_URL deve usar protocolo PostgreSQL.');
  }

  if (
    !['localhost', '127.0.0.1', '[::1]', '::1'].includes(
      url.hostname.toLowerCase(),
    )
  ) {
    throw new Error('DATABASE_URL deve apontar para PostgreSQL local.');
  }

  if (url.port !== '5433') {
    throw new Error('DATABASE_URL deve usar a porta de teste 5433.');
  }

  if (url.search || url.hash) {
    throw new Error('DATABASE_URL não pode conter query ou fragmento.');
  }

  let databaseName: string;
  try {
    databaseName = decodeURIComponent(url.pathname.slice(1));
  } catch {
    throw new Error('Nome do banco inválido.');
  }

  if (databaseName !== 'frotasync_test') {
    throw new Error(
      'Execução bloqueada: use exclusivamente o banco frotasync_test.',
    );
  }

  return url.toString();
}

const databaseUrl = validarDatabaseUrl(process.env.DATABASE_URL);

function gerarCnpjDeTeste(): string {
  return Array.from({ length: 14 }, () => randomInt(0, 10)).join('');
}

async function criarEmpresa(id: string, nome: string): Promise<void> {
  if (!prisma) throw new Error('PrismaService não inicializado.');

  await prisma.empresa.create({
    data: {
      id,
      nome_fantasia: nome,
      razao_social: `${nome} LTDA`,
      cnpj: gerarCnpjDeTeste(),
      segmento: 'Transporte',
      tipo_unidade: 'matriz',
      cep: '50000000',
      logradouro: 'Rua de Teste',
      numero: '100',
      bairro: 'Centro',
      cidade: 'Recife',
      uf: 'PE',
    },
  });

  idsCriados.empresas.push(id);
}

async function criarUnidade(
  id: string,
  empresaId: string,
  nome: string,
  codigo: string,
): Promise<void> {
  if (!prisma) throw new Error('PrismaService não inicializado.');

  await prisma.unidade.create({
    data: {
      id,
      empresa_id: empresaId,
      nome,
      codigo,
      cep: '50000001',
      logradouro: 'Rua de Teste',
      numero: '101',
      bairro: 'Centro',
      cidade: 'Recife',
      uf: 'PE',
    },
  });

  idsCriados.unidades.push(id);
}

async function criarTarefa(
  id: string,
  unidadeId: string,
  titulo: string,
): Promise<void> {
  if (!prisma) throw new Error('PrismaService não inicializado.');

  await prisma.tarefa.create({
    data: {
      id,
      unidade_id: unidadeId,
      titulo,
      descricao: 'Tarefa criada pela integração.',
      status: 'pendente',
      data_inicio: new Date('2026-11-23T00:00:00.000Z'),
      prazo: new Date('2035-12-15T00:00:00.000Z'),
    },
  });

  idsCriados.tarefas.push(id);
}

describe('TarefasService com PostgreSQL real', () => {
  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        TarefasService,
        {
          provide: ConfigService,
          useValue: new ConfigService({ DATABASE_URL: databaseUrl }),
        },
      ],
    }).compile();

    const connectedPrisma = testingModule.get(PrismaService);
    prisma = connectedPrisma;
    service = testingModule.get(TarefasService);

    await connectedPrisma.$connect();
    databaseConnected = true;

    const [database] = await connectedPrisma.$queryRaw<
      { database_name: string }[]
    >`SELECT current_database() AS database_name`;

    if (database?.database_name !== 'frotasync_test') {
      throw new Error('Conexão recusada: banco não é frotasync_test.');
    }

    await criarEmpresa(empresas.a, 'Empresa Integração A');
    await criarUnidade(
      unidades.a,
      empresas.a,
      'Unidade Integração A',
      'TASK-INT-A',
    );

    await criarEmpresa(empresas.b, 'Empresa Integração B');
    await criarUnidade(
      unidades.b,
      empresas.b,
      'Unidade Integração B',
      'TASK-INT-B',
    );

    await criarTarefa(
      tarefas.aPrincipal,
      unidades.a,
      'Revisão documental da frota',
    );
    await criarTarefa(tarefas.aOutra, unidades.a, 'Inspeção dos veículos');
    await criarTarefa(
      tarefas.bPrincipal,
      unidades.b,
      'Revisão documental da empresa B',
    );
  });

  afterAll(async () => {
    try {
      if (prisma && databaseConnected) {
        if (idsCriados.tarefas.length) {
          await prisma.tarefa.deleteMany({
            where: { id: { in: idsCriados.tarefas } },
          });
        }

        if (idsCriados.unidades.length) {
          await prisma.unidade.deleteMany({
            where: { id: { in: idsCriados.unidades } },
          });
        }

        if (idsCriados.empresas.length) {
          await prisma.empresa.deleteMany({
            where: { id: { in: idsCriados.empresas } },
          });
        }
      }
    } finally {
      await testingModule?.close();
    }
  });

  it('cria tarefa com status inicial e datas definidos pela API', async () => {
    const criada = await service.criar(
      unidades.a,
      {
        titulo: 'Nova tarefa de integração',
        descricao: 'Descrição inicial',
        prazoFinal: '2035-12-20',
      },
      empresas.a,
    );

    idsCriados.tarefas.push(criada.id);

    expect(criada).toMatchObject({
      id: criada.id,
      unidadeId: unidades.a,
      titulo: 'Nova tarefa de integração',
      status: 'pendente',
      prazoFinal: '2035-12-20',
      dataConclusao: null,
    });

    expect(criada.dataInicio).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const persistida = await prisma?.tarefa.findUnique({
      where: { id: criada.id },
    });

    expect(persistida).toMatchObject({
      status: 'pendente',
      data_conclusao: null,
      prazo: new Date('2035-12-20T00:00:00.000Z'),
    });
  });

  it('não permite criar tarefa em unidade de outra empresa', async () => {
    await expect(
      service.criar(
        unidades.b,
        {
          titulo: 'Tentativa entre empresas',
          prazoFinal: '2035-12-20',
        },
        empresas.a,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('bloqueia criação em unidade inativa com conflito', async () => {
    await prisma?.unidade.update({
      where: { id: unidades.a },
      data: { status: 'inativa' },
    });

    await expect(
      service.criar(
        unidades.a,
        {
          titulo: 'Tarefa em unidade inativa',
          prazoFinal: '2035-12-20',
        },
        empresas.a,
      ),
    ).rejects.toBeInstanceOf(ConflictException);

    await prisma?.unidade.update({
      where: { id: unidades.a },
      data: { status: 'ativa' },
    });
  });

  it('obtém tarefa da própria empresa', async () => {
    await expect(
      service.obter(tarefas.aPrincipal, empresas.a),
    ).resolves.toMatchObject({
      id: tarefas.aPrincipal,
      unidadeId: unidades.a,
      titulo: 'Revisão documental da frota',
    });
  });

  it('oculta tarefa de outra empresa e tarefa inexistente', async () => {
    await expect(
      service.obter(tarefas.aPrincipal, empresas.b),
    ).rejects.toBeInstanceOf(NotFoundException);

    await expect(
      service.obter(tarefas.inexistente, empresas.a),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('lista tarefas com isolamento, busca, filtro e paginação', async () => {
    const resultado = await service.listar(
      {
        q: 'revisão',
        page: 1,
        pageSize: 10,
      },
      empresas.a,
    );

    expect(resultado.items.map((item) => item.id)).toContain(
      tarefas.aPrincipal,
    );
    expect(resultado.items.map((item) => item.id)).not.toContain(
      tarefas.bPrincipal,
    );
    expect(resultado.total).toBeGreaterThanOrEqual(1);
    expect(resultado.page).toBe(1);
    expect(resultado.pageSize).toBe(10);
  });

  it('lista tarefas por unidade sem expor dados de outra empresa', async () => {
    const resultado = await service.listarPorUnidade(
      unidades.a,
      { page: 1, pageSize: 20 },
      empresas.a,
    );

    expect(resultado.items.length).toBeGreaterThanOrEqual(2);
    expect(resultado.items.every((item) => item.unidadeId === unidades.a)).toBe(
      true,
    );

    const resultadoOutraEmpresa = await service.listarPorUnidade(
      unidades.b,
      { page: 1, pageSize: 20 },
      empresas.a,
    );

    expect(resultadoOutraEmpresa.items).toHaveLength(0);
  });

  it('edita somente os campos informados e preserva o status', async () => {
    const atualizada = await service.atualizar(
      tarefas.aPrincipal,
      { titulo: 'Título atualizado pela integração' },
      empresas.a,
    );

    expect(atualizada).toMatchObject({
      id: tarefas.aPrincipal,
      titulo: 'Título atualizado pela integração',
      status: 'pendente',
    });

    const persistida = await prisma?.tarefa.findUnique({
      where: { id: tarefas.aPrincipal },
    });

    expect(persistida?.titulo).toBe('Título atualizado pela integração');
    expect(persistida?.status).toBe('pendente');
  });

  it('rejeita alteração de prazo para data passada', async () => {
    await expect(
      service.atualizar(
        tarefas.aPrincipal,
        { prazoFinal: '2020-01-01' },
        empresas.a,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('não permite editar tarefa de outra empresa', async () => {
    await expect(
      service.atualizar(
        tarefas.aPrincipal,
        { titulo: 'Alteração indevida' },
        empresas.b,
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('conclui tarefa persistindo data de conclusão', async () => {
    const atualizada = await service.atualizarStatus(
      tarefas.aPrincipal,
      { status: 'concluida', confirmacao: true },
      empresas.a,
    );

    expect(atualizada.status).toBe('concluida');
    expect(atualizada.dataConclusao).toEqual(expect.any(String));

    const persistida = await prisma?.tarefa.findUnique({
      where: { id: tarefas.aPrincipal },
    });

    expect(persistida?.status).toBe('concluida');
    expect(persistida?.data_conclusao).toBeInstanceOf(Date);
  });

  it('limpa data de conclusão ao sair do status concluída', async () => {
    const atualizada = await service.atualizarStatus(
      tarefas.aPrincipal,
      { status: 'em_andamento' },
      empresas.a,
    );

    expect(atualizada.status).toBe('em_andamento');
    expect(atualizada.dataConclusao).toBeNull();

    const persistida = await prisma?.tarefa.findUnique({
      where: { id: tarefas.aPrincipal },
    });

    expect(persistida?.status).toBe('em_andamento');
    expect(persistida?.data_conclusao).toBeNull();
  });

  it('bloqueia alteração de status em unidade inativa', async () => {
    await prisma?.unidade.update({
      where: { id: unidades.a },
      data: { status: 'inativa' },
    });

    await expect(
      service.atualizarStatus(
        tarefas.aOutra,
        { status: 'em_andamento' },
        empresas.a,
      ),
    ).rejects.toBeInstanceOf(ConflictException);

    await prisma?.unidade.update({
      where: { id: unidades.a },
      data: { status: 'ativa' },
    });
  });

  it('exclui tarefa própria e mantém tarefa de outra empresa', async () => {
    await service.excluir(tarefas.aOutra, empresas.a);

    await expect(
      prisma?.tarefa.findUnique({ where: { id: tarefas.aOutra } }),
    ).resolves.toBeNull();

    await expect(
      prisma?.tarefa.findUnique({ where: { id: tarefas.bPrincipal } }),
    ).resolves.toMatchObject({ id: tarefas.bPrincipal });
  });

  it('não permite excluir tarefa de outra empresa ou inexistente', async () => {
    await expect(
      service.excluir(tarefas.aPrincipal, empresas.b),
    ).rejects.toBeInstanceOf(NotFoundException);

    await expect(
      service.excluir(tarefas.inexistente, empresas.a),
    ).rejects.toBeInstanceOf(NotFoundException);

    await expect(
      prisma?.tarefa.findUnique({ where: { id: tarefas.aPrincipal } }),
    ).resolves.toMatchObject({ id: tarefas.aPrincipal });
  });
});
