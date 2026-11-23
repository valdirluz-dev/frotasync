import { randomUUID } from 'node:crypto';
import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { ListarUnidadesSchema } from './schemas/listar-unidades.schema';
import { UnidadesService } from './unidades.service';

describe('UnidadesService (integration)', () => {
  const sufixo = randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase();
  const criarCodigo = (prefixo: string) => `${prefixo}-${sufixo}`;
  const endereco = {
    cep: '50000000',
    logradouro: 'Rua de Teste',
    numero: '100',
    complemento: null,
    bairro: 'Centro',
    cidade: 'Recife',
    uf: 'PE',
  };

  let prisma: PrismaService;
  let service: UnidadesService;
  let moduleRef: Awaited<ReturnType<typeof createTestingModule>>;

  async function createTestingModule() {
    return Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
      ],
      providers: [UnidadesService],
    }).compile();
  }

  beforeAll(async () => {
    moduleRef = await createTestingModule();
    prisma = moduleRef.get(PrismaService);
    service = moduleRef.get(UnidadesService);
    await prisma.$connect();
  });

  afterAll(async () => {
    await moduleRef?.close();
  });

  it('deve consultar empresas reais no PostgreSQL', async () => {
    const empresas = await prisma.empresa.findMany({
      select: { id: true, nome_fantasia: true },
      take: 2,
    });

    expect(empresas.length).toBeGreaterThanOrEqual(2);
    expect(empresas[0].id).toBeDefined();
    expect(empresas[1].id).toBeDefined();
  });

  it('deve inicializar o serviço com acesso ao PostgreSQL real', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
  });

  it('deve reverter unidade criada em transação de teste', async () => {
    const empresa = await prisma.empresa.findFirst({
      select: { id: true },
    });

    expect(empresa).not.toBeNull();

    const codigo = criarCodigo('ROLLBACK');
    const sentinela = new Error('ROLLBACK_INTEGRATION_TEST');
    let rollbackConfirmado = false;

    try {
      await prisma.$transaction(async (tx) => {
        const unidade = await tx.unidade.create({
          data: {
            empresa_id: empresa!.id,
            nome: 'Unidade Teste Rollback',
            codigo,
            ...endereco,
          },
        });

        expect(unidade.codigo).toBe(codigo);

        const quantidade = await tx.unidade.count({
          where: { codigo },
        });

        expect(quantidade).toBe(1);

        throw sentinela;
      });
    } catch (error) {
      if (error === sentinela) {
        rollbackConfirmado = true;
      } else {
        throw error;
      }
    }

    expect(rollbackConfirmado).toBe(true);

    const persistida = await prisma.unidade.count({
      where: { codigo },
    });

    expect(persistida).toBe(0);
  });

  it('deve buscar nomes ignorando acentos', async () => {
    const sentinela = new Error('ROLLBACK_BUSCA');
    let resultado: any;

    try {
      await prisma.$transaction(async (tx) => {
        const empresa = await tx.empresa.findFirstOrThrow({
          select: { id: true },
        });

        await tx.unidade.createMany({
          data: [
            {
              empresa_id: empresa.id,
              nome: `São Paulo ${sufixo}`,
              codigo: criarCodigo('ACENTO1'),
              ...endereco,
            },
            {
              empresa_id: empresa.id,
              nome: `Sao Paulo ${sufixo}`,
              codigo: criarCodigo('ACENTO2'),
              ...endereco,
            },
          ],
        });

        const serviceIntegracao = new UnidadesService(
          tx as unknown as PrismaService,
        );

        resultado = await serviceIntegracao.listar(
          ListarUnidadesSchema.parse({ q: 'sao' }),
          empresa.id,
        );

        expect(resultado.total).toBe(2);
        expect(resultado.items).toHaveLength(2);

        throw sentinela;
      });
    } catch (error) {
      if (error !== sentinela) throw error;
    }
  });

  it('deve isolar unidades por empresa', async () => {
    const sentinela = new Error('ROLLBACK_TENANT');
    let totalEmpresaA = -1;

    try {
      await prisma.$transaction(async (tx) => {
        const empresas = await tx.empresa.findMany({
          select: { id: true },
          take: 2,
        });

        expect(empresas).toHaveLength(2);

        await tx.unidade.createMany({
          data: [
            {
              empresa_id: empresas[0].id,
              nome: `Unidade Tenant A ${sufixo}`,
              codigo: criarCodigo('TENANTA'),
              ...endereco,
            },
            {
              empresa_id: empresas[1].id,
              nome: `Unidade Tenant B ${sufixo}`,
              codigo: criarCodigo('TENANTB'),
              ...endereco,
            },
          ],
        });

        const serviceIntegracao = new UnidadesService(
          tx as unknown as PrismaService,
        );

        const resultado = await serviceIntegracao.listar(
          ListarUnidadesSchema.parse({ q: sufixo }),
          empresas[0].id,
        );

        totalEmpresaA = resultado.total;

        expect(resultado.items.every(
          (item) => item.nome.includes('Tenant A'),
        )).toBe(true);

        expect(resultado.total).toBe(1);

        const resultadoB = await serviceIntegracao.listar(
          ListarUnidadesSchema.parse({ q: sufixo }),
          empresas[1].id,
        );

        expect(resultadoB.total).toBe(1);
        expect(resultadoB.items[0].nome).toContain('Tenant B');

        throw sentinela;
      });
    } catch (error) {
      if (error !== sentinela) throw error;
    }

    expect(totalEmpresaA).toBe(1);
  });

  it('deve filtrar status e paginar no caminho ORM', async () => {
    const sentinela = new Error('ROLLBACK_ORM');
    let resultado: any;

    try {
      await prisma.$transaction(async (tx) => {
        const empresa = await tx.empresa.findFirstOrThrow({
          select: { id: true },
        });

        await tx.unidade.createMany({
          data: [
            {
              empresa_id: empresa.id,
              nome: `ORM Igual ${sufixo}`,
              codigo: criarCodigo('ORM001'),
              status: 'inativa',
              ...endereco,
            },
            {
              empresa_id: empresa.id,
              nome: `ORM Igual ${sufixo}`,
              codigo: criarCodigo('ORM002'),
              status: 'inativa',
              ...endereco,
            },
            {
              empresa_id: empresa.id,
              nome: `ORM Gamma ${sufixo}`,
              codigo: criarCodigo('ORM003'),
              status: 'ativa',
              ...endereco,
            },
          ],
        });

        const idsOrdenados = await tx.unidade.findMany({
          where: {
            empresa_id: empresa.id,
            nome: `ORM Igual ${sufixo}`,
          },
          orderBy: { id: 'asc' },
          select: { id: true },
        });

        const serviceIntegracao = new UnidadesService(
          tx as unknown as PrismaService,
        );

        resultado = await serviceIntegracao.listar(
          ListarUnidadesSchema.parse({
            status: 'inativa',
            page: 1,
            pageSize: 1,
          }),
          empresa.id,
        );

        expect(resultado.total).toBe(2);
        expect(resultado.totalPages).toBe(2);
        expect(resultado.page).toBe(1);
        expect(resultado.items).toHaveLength(1);

        const segundaPagina = await serviceIntegracao.listar(
          ListarUnidadesSchema.parse({
            status: 'inativa',
            page: 2,
            pageSize: 1,
          }),
          empresa.id,
        );

        expect(segundaPagina.items).toHaveLength(1);
        expect(segundaPagina.page).toBe(2);
        expect(resultado.items[0].id).toBe(idsOrdenados[0].id);
        expect(segundaPagina.items[0].id).toBe(idsOrdenados[1].id);

        const ativas = await serviceIntegracao.listar(
          ListarUnidadesSchema.parse({ status: 'ativa' }),
          empresa.id,
        );

        expect(ativas.items.every(
          (item) => item.status === 'ativa',
        )).toBe(true);

        throw sentinela;
      });
    } catch (error) {
      if (error !== sentinela) throw error;
    }
  });

  it('deve ajustar pagina solicitada acima do limite', async () => {
    const sentinela = new Error('ROLLBACK_PAGE_LIMIT');

    try {
      await prisma.$transaction(async (tx) => {
        const empresa = await tx.empresa.findFirstOrThrow({
          select: { id: true },
        });

        await tx.unidade.createMany({
          data: [
            {
              empresa_id: empresa.id,
              nome: `Limite Alpha ${sufixo}`,
              codigo: criarCodigo('LIMIT001'),
              status: 'inativa',
              ...endereco,
            },
            {
              empresa_id: empresa.id,
              nome: `Limite Beta ${sufixo}`,
              codigo: criarCodigo('LIMIT002'),
              status: 'inativa',
              ...endereco,
            },
          ],
        });

        const serviceIntegracao = new UnidadesService(
          tx as unknown as PrismaService,
        );

        const resultado = await serviceIntegracao.listar(
          ListarUnidadesSchema.parse({
            status: 'inativa',
            page: 999,
            pageSize: 1,
          }),
          empresa.id,
        );

        expect(resultado.total).toBe(2);
        expect(resultado.totalPages).toBe(2);
        expect(resultado.page).toBe(2);
        expect(resultado.items).toHaveLength(1);

        throw sentinela;
      });
    } catch (error) {
      if (error !== sentinela) throw error;
    }
  });

  it('deve tratar percentual como caractere literal na busca', async () => {
    const sentinela = new Error('ROLLBACK_PERCENT');

    try {
      await prisma.$transaction(async (tx) => {
        const empresa = await tx.empresa.findFirstOrThrow({
          select: { id: true },
        });

        const codigo = criarCodigo('PERCENT%');

        await tx.unidade.create({
          data: {
            empresa_id: empresa.id,
            nome: `Percentual ${sufixo}`,
            codigo,
            ...endereco,
          },
        });

        const serviceIntegracao = new UnidadesService(
          tx as unknown as PrismaService,
        );

        const resultado = await serviceIntegracao.listar(
          ListarUnidadesSchema.parse({ q: '%' }),
          empresa.id,
        );

        expect(resultado.total).toBe(1);
        expect(resultado.items[0].codigo).toBe(codigo);

        throw sentinela;
      });
    } catch (error) {
      if (error !== sentinela) throw error;
    }
  });

  it('deve tratar underscore como caractere literal na busca', async () => {
    const sentinela = new Error('ROLLBACK_UNDERSCORE');

    try {
      await prisma.$transaction(async (tx) => {
        const empresa = await tx.empresa.findFirstOrThrow({
          select: { id: true },
        });

        const codigo = criarCodigo('UNDER_SCORE');

        await tx.unidade.create({
          data: {
            empresa_id: empresa.id,
            nome: `Underscore ${sufixo}`,
            codigo,
            ...endereco,
          },
        });

        const serviceIntegracao = new UnidadesService(
          tx as unknown as PrismaService,
        );

        const resultado = await serviceIntegracao.listar(
          ListarUnidadesSchema.parse({ q: '_' }),
          empresa.id,
        );

        expect(resultado.total).toBe(1);
        expect(resultado.items[0].codigo).toBe(codigo);

        throw sentinela;
      });
    } catch (error) {
      if (error !== sentinela) throw error;
    }
  });

  it('deve tratar barra invertida como caractere literal na busca', async () => {
    const sentinela = new Error('ROLLBACK_BACKSLASH');

    try {
      await prisma.$transaction(async (tx) => {
        const empresa = await tx.empresa.findFirstOrThrow({
          select: { id: true },
        });

        const codigo = `${criarCodigo('BACKSLASH')}\\`;

        await tx.unidade.create({
          data: {
            empresa_id: empresa.id,
            nome: `Backslash ${sufixo}`,
            codigo,
            ...endereco,
          },
        });

        const serviceIntegracao = new UnidadesService(
          tx as unknown as PrismaService,
        );

        const resultado = await serviceIntegracao.listar(
          ListarUnidadesSchema.parse({ q: '\\' }),
          empresa.id,
        );

        expect(resultado.total).toBe(1);
        expect(resultado.items[0].codigo).toBe(codigo);

        throw sentinela;
      });
    } catch (error) {
      if (error !== sentinela) throw error;
    }
  });

it('deve retornar contagem de documentos e tarefas no caminho ORM', async () => {
  const empresa = await prisma.empresa.findFirstOrThrow({
    select: { id: true },
  });
  const codigo = criarCodigo('CNT');

  try {
    await prisma.$transaction(async (tx) => {
      const unidade = await tx.unidade.create({
        data: {
          empresa_id: empresa.id,
          nome: `Contagem ${sufixo}`,
          codigo,
          ...endereco,
        },
      });

      await tx.documento.createMany({
        data: [
          {
            unidade_id: unidade.id,
            nome: 'Documento 1',
            categoria: 'teste',
            data_validade: new Date('2030-12-31'),
            anexo_nome: 'teste.pdf',
            anexo_url: 'https://example.com/teste.pdf',
            anexo_tamanho_bytes: 100,
            anexo_tipo: 'application/pdf',
          },
          {
            unidade_id: unidade.id,
            nome: 'Documento 2',
            categoria: 'teste',
            data_validade: new Date('2030-12-31'),
            anexo_nome: 'teste2.pdf',
            anexo_url: 'https://example.com/teste2.pdf',
            anexo_tamanho_bytes: 200,
            anexo_tipo: 'application/pdf',
          },
        ],
      });

      await tx.tarefa.create({
        data: {
          unidade_id: unidade.id,
          titulo: 'Tarefa de integração',
          prazo: new Date('2030-12-31'),
        },
      });

      const resultado = await new UnidadesService(
        tx as unknown as PrismaService,
      ).listar({ page: 1, pageSize: 20 }, empresa.id);

      const item = resultado.items.find((i) => i.codigo === codigo);

      expect(item).toBeDefined();
      expect(item!.totalDocumentos).toBe(2);
      expect(item!.totalTarefas).toBe(1);

      throw new Error('ROLLBACK_INTEGRACAO');
    });
  } catch (erro) {
    if (
      erro instanceof Error &&
      erro.message === 'ROLLBACK_INTEGRACAO'
    ) {
      return;
    }
    throw erro;
  }
});

it('deve manter ordenação estável na paginação SQL raw', async () => {
  const sentinela = new Error('ROLLBACK_RAW');
  let idsOrdenados: { id: string }[] = [];

  try {
    await prisma.$transaction(async (tx) => {
      const empresa = await tx.empresa.findFirstOrThrow({
        select: { id: true },
      });
      const nome = `Raw Igual ${sufixo}`;

      await tx.unidade.createMany({
        data: ['RAW001', 'RAW002'].map((codigo) => ({
          empresa_id: empresa.id,
          nome,
          codigo: criarCodigo(codigo),
          ...endereco,
        })),
      });

      idsOrdenados = await tx.unidade.findMany({
        where: { empresa_id: empresa.id, nome },
        orderBy: { id: 'asc' },
        select: { id: true },
      });

      const service = new UnidadesService(
        tx as unknown as PrismaService,
      );

      const primeira = await service.listar(
        { q: nome, page: 1, pageSize: 1 },
        empresa.id,
      );
      const segunda = await service.listar(
        { q: nome, page: 2, pageSize: 1 },
        empresa.id,
      );

      expect(primeira.total).toBe(2);
      expect(primeira.items[0].id).toBe(idsOrdenados[0].id);
      expect(segunda.items[0].id).toBe(idsOrdenados[1].id);

      throw sentinela;
    });
  } catch (error) {
    if (error !== sentinela) throw error;
  }
});

it('deve retornar contagem de documentos e tarefas na busca SQL raw', async () => {
  const empresa = await prisma.empresa.findFirstOrThrow({
    select: { id: true },
  });
  const codigo = criarCodigo('RAW');

  try {
    await prisma.$transaction(async (tx) => {
      const unidade = await tx.unidade.create({
        data: {
          empresa_id: empresa.id,
          nome: `Raw ${sufixo}`,
          codigo,
          ...endereco,
        },
      });

      await tx.documento.createMany({
        data: Array.from({ length: 2 }, (_, i) => ({
          unidade_id: unidade.id,
          nome: `Documento ${i + 1}`,
          categoria: 'teste',
          data_validade: new Date('2030-12-31'),
          anexo_nome: 'teste.pdf',
          anexo_url: 'https://example.com/teste.pdf',
          anexo_tamanho_bytes: 100,
          anexo_tipo: 'application/pdf',
        })),
      });

      await tx.tarefa.createMany({
        data: Array.from({ length: 3 }, (_, i) => ({
          unidade_id: unidade.id,
          titulo: `Tarefa ${i + 1}`,
          prazo: new Date('2030-12-31'),
        })),
      });

      const resultado = await new UnidadesService(
        tx as unknown as PrismaService,
      ).listar({ q: codigo, page: 1, pageSize: 20 }, empresa.id);

      expect(resultado.total).toBe(1);
      expect(resultado.items[0].codigo).toBe(codigo);
      expect(resultado.items[0].totalDocumentos).toBe(2);
      expect(resultado.items[0].totalTarefas).toBe(3);

      throw new Error('ROLLBACK_INTEGRACAO');
    });
  } catch (erro) {
    if (erro instanceof Error && erro.message === 'ROLLBACK_INTEGRACAO') {
      return;
    }
    throw erro;
  }
});

});
