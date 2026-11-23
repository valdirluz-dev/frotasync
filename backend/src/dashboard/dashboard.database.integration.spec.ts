import { randomInt, randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardService } from './dashboard.service';

const empresas = {
  a: randomUUID(),
  b: randomUUID(),
};

const unidades = {
  ativa: randomUUID(),
  inativa: randomUUID(),
  outraEmpresa: randomUUID(),
};

const idsCriados = {
  empresas: [] as string[],
  unidades: [] as string[],
  documentos: [] as string[],
  tarefas: [] as string[],
};

let testingModule: TestingModule | undefined;
let prisma: PrismaService | undefined;
let service: DashboardService;
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
  status: 'ativa' | 'inativa' = 'ativa',
): Promise<void> {
  if (!prisma) throw new Error('PrismaService não inicializado.');

  await prisma.unidade.create({
    data: {
      id,
      empresa_id: empresaId,
      nome,
      codigo,
      status,
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

async function criarDocumento(
  unidadeId: string,
  nome: string,
  dataValidade: string,
): Promise<void> {
  if (!prisma) throw new Error('PrismaService não inicializado.');

  const id = randomUUID();

  await prisma.documento.create({
    data: {
      id,
      unidade_id: unidadeId,
      nome,
      categoria: 'Integração',
      data_emissao: new Date('2025-01-01T00:00:00.000Z'),
      data_validade: new Date(`${dataValidade}T00:00:00.000Z`),
      anexo_nome: `${id}.pdf`,
      anexo_url: `integration-test/${id}`,
      anexo_tamanho_bytes: BigInt(100),
      anexo_tipo: 'application/pdf',
    },
  });

  idsCriados.documentos.push(id);
}

async function criarTarefa(
  unidadeId: string,
  titulo: string,
  status: 'pendente' | 'em_andamento' | 'concluida',
  dataConclusao?: string,
): Promise<void> {
  if (!prisma) throw new Error('PrismaService não inicializado.');

  const id = randomUUID();

  await prisma.tarefa.create({
    data: {
      id,
      unidade_id: unidadeId,
      titulo,
      descricao: 'Tarefa criada pela integração do dashboard.',
      status,
      data_inicio: new Date('2026-01-01T00:00:00.000Z'),
      prazo: new Date('2035-12-31T00:00:00.000Z'),
      data_conclusao: dataConclusao
        ? new Date(`${dataConclusao}T12:00:00-03:00`)
        : null,
    },
  });

  idsCriados.tarefas.push(id);
}

describe('DashboardService com PostgreSQL real', () => {
  let dataAtual: string;
  let dataAnterior: string;

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        DashboardService,
        {
          provide: ConfigService,
          useValue: new ConfigService({ DATABASE_URL: databaseUrl }),
        },
      ],
    }).compile();

    const prismaConectado = testingModule.get(PrismaService);
    prisma = prismaConectado;
    service = testingModule.get(DashboardService);

    await prismaConectado.$connect();
    databaseConnected = true;

    const [database] = await prismaConectado.$queryRaw<
      { database_name: string }[]
    >`SELECT current_database() AS database_name`;

    if (database?.database_name !== 'frotasync_test') {
      throw new Error('Conexão recusada: banco não é frotasync_test.');
    }

    const [referencias] = await prismaConectado.$queryRaw<
      { atual: string; anterior: string }[]
    >`
      SELECT
        TO_CHAR(
          (CURRENT_TIMESTAMP AT TIME ZONE 'America/Recife')::date,
          'YYYY-MM-DD'
        ) AS atual,
        TO_CHAR(
          (
            (CURRENT_TIMESTAMP AT TIME ZONE 'America/Recife')::date
            - INTERVAL '1 month'
          )::date,
          'YYYY-MM-DD'
        ) AS anterior
    `;

    if (!referencias) {
      throw new Error('Não foi possível obter as datas de referência.');
    }

    dataAtual = referencias.atual;
    dataAnterior = referencias.anterior;

    await criarEmpresa(empresas.a, 'Dashboard Integração A');
    await criarEmpresa(empresas.b, 'Dashboard Integração B');

    await criarUnidade(
      unidades.ativa,
      empresas.a,
      'Unidade Dashboard Ativa',
      `DASH-A-${randomUUID().slice(0, 8)}`,
    );

    await criarUnidade(
      unidades.inativa,
      empresas.a,
      'Unidade Dashboard Inativa',
      `DASH-I-${randomUUID().slice(0, 8)}`,
      'inativa',
    );

    await criarUnidade(
      unidades.outraEmpresa,
      empresas.b,
      'Unidade Outra Empresa',
      `DASH-B-${randomUUID().slice(0, 8)}`,
    );

    const adicionarDias = (data: string, dias: number): string => {
      const resultado = new Date(`${data}T00:00:00.000Z`);
      resultado.setUTCDate(resultado.getUTCDate() + dias);
      return resultado.toISOString().slice(0, 10);
    };

    await criarDocumento(
      unidades.ativa,
      'Documento válido',
      adicionarDias(dataAtual, 30),
    );

    await criarDocumento(
      unidades.ativa,
      'Documento próximo do vencimento',
      adicionarDias(dataAtual, 5),
    );

    await criarDocumento(
      unidades.ativa,
      'Documento que estava próximo no período anterior',
      adicionarDias(dataAnterior, 5),
    );

    await criarDocumento(
      unidades.ativa,
      'Documento expirado anteriormente',
      adicionarDias(dataAnterior, -5),
    );

    await criarTarefa(unidades.ativa, 'Tarefa pendente', 'pendente');

    await criarTarefa(unidades.ativa, 'Tarefa em andamento', 'em_andamento');

    await criarTarefa(
      unidades.ativa,
      'Tarefa concluída no período anterior',
      'concluida',
      dataAnterior,
    );

    await criarTarefa(
      unidades.ativa,
      'Tarefa concluída no período atual',
      'concluida',
      dataAtual,
    );
  });

  afterAll(async () => {
    try {
      if (prisma && databaseConnected) {
        if (idsCriados.documentos.length) {
          await prisma.documento.deleteMany({
            where: { id: { in: idsCriados.documentos } },
          });
        }

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

  it('calcula indicadores globais e variações usando o PostgreSQL', async () => {
    const resultado = await service.obterIndicadores(empresas.a);

    expect(resultado).toMatchObject({
      totalUnidades: 2,
      totalDocumentos: 4,
      totalTarefasPendentes: 1,
      totalPendencias: 5,
      unidades: {
        ativas: 1,
        inativas: 1,
      },
      documentos: {
        valido: 1,
        proximoVencimento: 1,
        expirado: 2,
      },
      tarefas: {
        pendente: 1,
        emAndamento: 1,
        concluida: 2,
      },
      variacao: {
        referencia: 'mes_anterior',
        documentosProximosVencimento: {
          atual: 1,
          anterior: 1,
          percentual: 0,
        },
        documentosExpirados: {
          atual: 2,
          anterior: 1,
          percentual: 100,
        },
        tarefasConcluidas: {
          atual: 2,
          anterior: 1,
          percentual: 100,
        },
      },
    });
  });

  it('retorna indicadores zerados quando a empresa não possui registros', async () => {
    const resultado = await service.obterIndicadores(empresas.b);

    expect(resultado).toMatchObject({
      totalUnidades: 1,
      totalDocumentos: 0,
      totalTarefasPendentes: 0,
      totalPendencias: 0,
      unidades: {
        ativas: 1,
        inativas: 0,
      },
      documentos: {
        valido: 0,
        proximoVencimento: 0,
        expirado: 0,
      },
      tarefas: {
        pendente: 0,
        emAndamento: 0,
        concluida: 0,
      },
      variacao: {
        documentosProximosVencimento: {
          atual: 0,
          anterior: 0,
          percentual: null,
        },
        documentosExpirados: {
          atual: 0,
          anterior: 0,
          percentual: null,
        },
        tarefasConcluidas: {
          atual: 0,
          anterior: 0,
          percentual: null,
        },
      },
    });
  });

  it('calcula indicadores da unidade e suas pendências', async () => {
    const resultado = await service.obterIndicadoresUnidade(
      unidades.ativa,
      empresas.a,
    );

    expect(resultado).toMatchObject({
      unidadeId: unidades.ativa,
      totalPendencias: 5,
      documentos: {
        total: 4,
        valido: 1,
        proximoVencimento: 1,
        expirado: 2,
      },
      tarefas: {
        total: 4,
        pendente: 1,
        emAndamento: 1,
        concluida: 2,
      },
      variacao: {
        referencia: 'mes_anterior',
        documentosProximosVencimento: {
          atual: 1,
          anterior: 1,
          percentual: 0,
        },
        documentosExpirados: {
          atual: 2,
          anterior: 1,
          percentual: 100,
        },
        tarefasConcluidas: {
          atual: 2,
          anterior: 1,
          percentual: 100,
        },
      },
    });
  });

  it('não permite consultar unidade pertencente a outra empresa', async () => {
    await expect(
      service.obterIndicadoresUnidade(unidades.outraEmpresa, empresas.a),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('retorna zero indicadores para unidade válida sem documentos ou tarefas', async () => {
    const resultado = await service.obterIndicadoresUnidade(
      unidades.inativa,
      empresas.a,
    );

    expect(resultado).toMatchObject({
      unidadeId: unidades.inativa,
      totalPendencias: 0,
      documentos: {
        total: 0,
        valido: 0,
        proximoVencimento: 0,
        expirado: 0,
      },
      tarefas: {
        total: 0,
        pendente: 0,
        emAndamento: 0,
        concluida: 0,
      },
      variacao: {
        documentosProximosVencimento: {
          atual: 0,
          anterior: 0,
          percentual: null,
        },
        documentosExpirados: {
          atual: 0,
          anterior: 0,
          percentual: null,
        },
        tarefasConcluidas: {
          atual: 0,
          anterior: 0,
          percentual: null,
        },
      },
    });
  });
});
