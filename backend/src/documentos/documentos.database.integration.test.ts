import { randomInt, randomUUID } from 'node:crypto';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import type { StorageReadResult } from '../storage/interfaces/storage.interface';
import { StorageService } from '../storage/storage.service';
import { DocumentosService } from './documentos.service';

const empresas = {
  a: randomUUID(),
  b: randomUUID(),
};
const unidades = {
  a: randomUUID(),
  b: randomUUID(),
};
const documentos = {
  aDownload: randomUUID(),
  aAmbientalDuplicado: randomUUID(),
  aLegal: randomUUID(),
  aEspacos: randomUUID(),
  aVazia: randomUUID(),
  aExcluir: randomUUID(),
  bAmbiental: randomUUID(),
  bAmbientalDuplicado: randomUUID(),
  bFiscal: randomUUID(),
  bManter: randomUUID(),
  inexistente: randomUUID(),
};

const conteudoAnexo = Buffer.from('%PDF-1.7\narquivo de teste');
const resultadoLeitura: StorageReadResult = {
  buffer: conteudoAnexo,
  mimeType: 'application/pdf',
  size: conteudoAnexo.byteLength,
};

const storageMock = {
  read: jest.fn<(key: string) => Promise<StorageReadResult>>(),
  delete: jest.fn<(key: string) => Promise<void>>(),
};

const idsCriados = {
  empresas: [] as string[],
  unidades: [] as string[],
  documentos: [] as string[],
};

let testingModule: TestingModule | undefined;
let prisma: PrismaService | undefined;
let service: DocumentosService;
let databaseConnected = false;

function validarDatabaseUrl(databaseUrl: string | undefined): string {
  if (!databaseUrl?.trim()) {
    throw new Error(
      'DATABASE_URL deve estar definida para executar os testes de integração.',
    );
  }

  const connectionString = databaseUrl.trim();
  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    throw new Error(
      'DATABASE_URL deve ser uma URL PostgreSQL válida para executar os testes de integração.',
    );
  }

  if (url.protocol !== 'postgres:' && url.protocol !== 'postgresql:') {
    throw new Error(
      'DATABASE_URL deve usar o protocolo postgres ou postgresql.',
    );
  }

  const hostname = url.hostname.toLowerCase();
  if (!['localhost', '127.0.0.1', '[::1]', '::1'].includes(hostname)) {
    throw new Error(
      'DATABASE_URL deve apontar para um PostgreSQL local (localhost ou loopback).',
    );
  }

  if (url.port !== '5433') {
    throw new Error(
      'DATABASE_URL deve usar a porta PostgreSQL local de teste 5433.',
    );
  }

  if (url.search) {
    throw new Error(
      'DATABASE_URL não pode conter parâmetros de query; esta suíte não exige parâmetros adicionais.',
    );
  }
  if (url.hash) {
    throw new Error('DATABASE_URL não pode conter fragmento.');
  }

  if (!url.pathname || url.pathname === '/') {
    throw new Error('DATABASE_URL deve incluir o nome do banco de dados.');
  }

  if (url.pathname.slice(1).includes('/')) {
    throw new Error('DATABASE_URL deve conter um único nome de banco de dados.');
  }

  let databaseName: string;
  try {
    databaseName = decodeURIComponent(url.pathname.slice(1));
  } catch {
    throw new Error('DATABASE_URL contém um nome de banco inválido.');
  }

  if (databaseName === 'frotasync') {
    throw new Error(
      'Execução bloqueada: o banco de desenvolvimento frotasync é proibido.',
    );
  }
  if (databaseName !== 'frotasync_test') {
    throw new Error(
      'Execução bloqueada: DATABASE_URL deve apontar exclusivamente para o banco frotasync_test.',
    );
  }

  return connectionString;
}

const databaseUrl = validarDatabaseUrl(process.env.DATABASE_URL);

function gerarCnpjDeTeste(): string {
  return Array.from({ length: 14 }, () => randomInt(0, 10)).join('');
}

async function criarEmpresa(id: string, nome: string): Promise<void> {
  if (!prisma) {
    throw new Error('PrismaService não foi inicializado.');
  }

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

async function criarDocumento(
  id: string,
  unidadeId: string,
  nome: string,
  categoria: string,
): Promise<void> {
  if (!prisma) {
    throw new Error('PrismaService não foi inicializado.');
  }

  await prisma.documento.create({
    data: {
      id,
      unidade_id: unidadeId,
      nome,
      tipo: 'Licença',
      categoria,
      data_emissao: new Date('2025-01-01T00:00:00.000Z'),
      data_validade: new Date('2035-12-31T00:00:00.000Z'),
      descricao: 'Documento criado pela suíte de integração.',
      anexo_nome: `${id}.pdf`,
      anexo_url: `integration-test/${id}`,
      anexo_tamanho_bytes: BigInt(conteudoAnexo.byteLength),
      anexo_tipo: 'application/pdf',
    },
  });
  idsCriados.documentos.push(id);
}

async function criarDadosDeTeste(): Promise<void> {
  if (!prisma) {
    throw new Error('PrismaService não foi inicializado.');
  }

  await criarEmpresa(empresas.a, 'Empresa Teste A');
  await prisma.unidade.create({
    data: {
      id: unidades.a,
      empresa_id: empresas.a,
      nome: 'Unidade Teste A',
      codigo: 'INTEGRATION-A',
      cep: '50000001',
      logradouro: 'Rua de Teste',
      numero: '101',
      bairro: 'Centro',
      cidade: 'Recife',
      uf: 'PE',
    },
  });
  idsCriados.unidades.push(unidades.a);

  await criarEmpresa(empresas.b, 'Empresa Teste B');
  await prisma.unidade.create({
    data: {
      id: unidades.b,
      empresa_id: empresas.b,
      nome: 'Unidade Teste B',
      codigo: 'INTEGRATION-B',
      cep: '50000002',
      logradouro: 'Rua de Teste',
      numero: '102',
      bairro: 'Centro',
      cidade: 'Recife',
      uf: 'PE',
    },
  });
  idsCriados.unidades.push(unidades.b);

  await criarDocumento(
    documentos.aDownload,
    unidades.a,
    'Licença Ambiental A',
    'Ambiental',
  );
  await criarDocumento(
    documentos.aAmbientalDuplicado,
    unidades.a,
    'Outra Licença Ambiental A',
    'Ambiental',
  );
  await criarDocumento(
    documentos.aLegal,
    unidades.a,
    'Contrato Legal A',
    'Legal',
  );
  await criarDocumento(
    documentos.aEspacos,
    unidades.a,
    'Categoria com espaços A',
    '   ',
  );
  await criarDocumento(documentos.aVazia, unidades.a, 'Categoria vazia A', '');
  await criarDocumento(
    documentos.aExcluir,
    unidades.a,
    'Documento para excluir A',
    'Legal',
  );
  await criarDocumento(
    documentos.bAmbiental,
    unidades.b,
    'Licença Ambiental B',
    'Ambiental',
  );
  await criarDocumento(
    documentos.bAmbientalDuplicado,
    unidades.b,
    'Outra Licença Ambiental B',
    'Ambiental',
  );
  await criarDocumento(
    documentos.bFiscal,
    unidades.b,
    'Documento Fiscal B',
    'Fiscal',
  );
  await criarDocumento(
    documentos.bManter,
    unidades.b,
    'Documento preservado B',
    'Fiscal',
  );
}

describe('DocumentosService com PostgreSQL real', () => {
  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        DocumentosService,
        {
          provide: ConfigService,
          useValue: new ConfigService({ DATABASE_URL: databaseUrl }),
        },
        { provide: StorageService, useValue: storageMock },
      ],
    }).compile();

    const connectedPrisma = testingModule.get(PrismaService);
    prisma = connectedPrisma;
    service = testingModule.get(DocumentosService);
    await connectedPrisma.$connect();
    databaseConnected = true;
    const [database] = await connectedPrisma.$queryRaw<
      { database_name: string }[]
    >`SELECT current_database() AS database_name`;
    if (database?.database_name !== 'frotasync_test') {
      throw new Error(
        'Conexão recusada: o PostgreSQL não confirmou o banco frotasync_test.',
      );
    }

    await criarDadosDeTeste();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    storageMock.read.mockResolvedValue(resultadoLeitura);
    storageMock.delete.mockResolvedValue();
  });

  afterAll(async () => {
    try {
      if (prisma && databaseConnected) {
        if (idsCriados.documentos.length) {
          await prisma.documento.deleteMany({
            where: { id: { in: idsCriados.documentos } },
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

  it('lista categorias únicas, ordenadas e isoladas por empresa', async () => {
    await expect(service.listarCategorias(empresas.a)).resolves.toEqual([
      'Ambiental',
      'Legal',
    ]);
    await expect(service.listarCategorias(empresas.b)).resolves.toEqual([
      'Ambiental',
      'Fiscal',
    ]);
  });

  it('permite obter documento da própria empresa', async () => {
    await expect(
      service.obter(documentos.aDownload, empresas.a),
    ).resolves.toMatchObject({
      id: documentos.aDownload,
      categoria: 'Ambiental',
      anexo: {
        nome: `${documentos.aDownload}.pdf`,
        tamanhoBytes: conteudoAnexo.byteLength,
        tipo: 'application/pdf',
      },
    });
  });

  it('não permite obter documento de outra empresa', async () => {
    await expect(
      service.obter(documentos.aDownload, empresas.b),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('retorna NotFoundException para documento inexistente ao obter', async () => {
    await expect(
      service.obter(documentos.inexistente, empresas.a),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('baixa anexo próprio com buffer, MIME, tamanho e nome', async () => {
    await expect(
      service.baixarAnexo(documentos.aDownload, empresas.a),
    ).resolves.toEqual({
      ...resultadoLeitura,
      fileName: `${documentos.aDownload}.pdf`,
    });
    expect(storageMock.read).toHaveBeenCalledWith(
      `integration-test/${documentos.aDownload}`,
    );
  });

  it('não baixa anexo de outra empresa nem chama o Storage', async () => {
    await expect(
      service.baixarAnexo(documentos.aDownload, empresas.b),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(storageMock.read).not.toHaveBeenCalled();
  });

  it('retorna NotFoundException para documento inexistente ao baixar', async () => {
    await expect(
      service.baixarAnexo(documentos.inexistente, empresas.a),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(storageMock.read).not.toHaveBeenCalled();
  });

  it('exclui documento autorizado e mantém intacto o documento da Empresa B', async () => {
    await service.excluir(documentos.aExcluir, empresas.a);

    await expect(
      prisma?.documento.findUnique({ where: { id: documentos.aExcluir } }),
    ).resolves.toBeNull();
    await expect(
      prisma?.documento.findUnique({ where: { id: documentos.bManter } }),
    ).resolves.toMatchObject({ id: documentos.bManter });
    expect(storageMock.read).toHaveBeenCalledWith(
      `integration-test/${documentos.aExcluir}`,
    );
    expect(storageMock.delete).toHaveBeenCalledWith(
      `integration-test/${documentos.aExcluir}`,
    );
  });

  it('não exclui documento de outra empresa', async () => {
    await expect(
      service.excluir(documentos.aDownload, empresas.b),
    ).rejects.toBeInstanceOf(NotFoundException);

    await expect(
      prisma?.documento.findUnique({ where: { id: documentos.aDownload } }),
    ).resolves.toMatchObject({ id: documentos.aDownload });
    expect(storageMock.read).not.toHaveBeenCalled();
    expect(storageMock.delete).not.toHaveBeenCalled();
  });

  it('retorna NotFoundException para documento inexistente ao excluir', async () => {
    await expect(
      service.excluir(documentos.inexistente, empresas.a),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(storageMock.read).not.toHaveBeenCalled();
    expect(storageMock.delete).not.toHaveBeenCalled();
  });
});
