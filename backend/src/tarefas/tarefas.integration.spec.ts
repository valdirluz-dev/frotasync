import {
  ExecutionContext,
  INestApplication,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { AddressInfo } from 'node:net';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { GlobalExceptionFilter } from '../common/filters/global-exception.filter';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TarefasController } from './tarefas.controller';
import { TarefasService } from './tarefas.service';

const empresaId = 'c3c4a4b7-14ba-4204-a341-7896853621b4';
const unidadeId = 'd9428888-122b-4b42-9acc-2a83c47b3f6e';
const tarefaId = 'a0cd295f-5787-493b-a3d0-c85029a75fc8';

const tarefaDto = {
  id: tarefaId,
  unidadeId,
  unidadeNome: 'Unidade Norte',
  titulo: 'Revisar documentação',
  descricao: 'Conferir documentos pendentes',
  status: 'pendente',
  dataInicio: '2026-11-23',
  prazoFinal: '2026-12-15',
  dataConclusao: null,
  criadoEm: '2026-11-23T10:00:00.000Z',
  atualizadoEm: '2026-11-23T10:00:00.000Z',
} satisfies Awaited<ReturnType<TarefasService['criar']>>;

const paginaTarefas = {
  items: [tarefaDto],
  page: 1,
  pageSize: 20,
  total: 1,
  totalPages: 1,
} satisfies Awaited<ReturnType<TarefasService['listar']>>;

const tarefasService = {
  listar: jest.fn<TarefasService['listar']>(),
  listarPorUnidade: jest.fn<TarefasService['listarPorUnidade']>(),
  obter: jest.fn<TarefasService['obter']>(),
  criar: jest.fn<TarefasService['criar']>(),
  atualizar: jest.fn<TarefasService['atualizar']>(),
  atualizarStatus: jest.fn<TarefasService['atualizarStatus']>(),
  excluir: jest.fn<TarefasService['excluir']>(),
};

let app: INestApplication;
let baseUrl: string;

describe('Tarefas HTTP integration', () => {
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TarefasController],
      providers: [
        RolesGuard,
        {
          provide: TarefasService,
          useValue: tarefasService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate(context: ExecutionContext): boolean {
          const request = context
            .switchToHttp()
            .getRequest<AuthenticatedRequest>();
          const papel = request.header('x-test-role');

          if (!papel) {
            throw new UnauthorizedException();
          }

          request.user = {
            id: 'usuario-teste',
            email: 'teste@example.com',
            papel,
            empresaId,
          };

          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.listen(0, '127.0.0.1');

    const address = app.getHttpServer().address() as AddressInfo | null;
    if (!address || typeof address === 'string') {
      throw new Error('Não foi possível obter a porta do servidor de testes.');
    }

    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    tarefasService.listar.mockResolvedValue(paginaTarefas);
    tarefasService.listarPorUnidade.mockResolvedValue(paginaTarefas);
    tarefasService.obter.mockResolvedValue(tarefaDto);
    tarefasService.criar.mockResolvedValue(tarefaDto);
    tarefasService.atualizar.mockResolvedValue(tarefaDto);
    tarefasService.atualizarStatus.mockResolvedValue({
      ...tarefaDto,
      status: 'concluida',
      dataConclusao: '2026-11-23T12:00:00.000Z',
    });
    tarefasService.excluir.mockResolvedValue();
  });

  afterAll(async () => {
    await app.close();
  });

  it.each(['colaborador', 'gestor', 'administrador'])(
    'lista tarefas globalmente por HTTP para o perfil %s',
    async (papel) => {
      const response = await fetch(
        `${baseUrl}/api/v1/tarefas?q=revisar&status=pendente&page=1&pageSize=20`,
        { headers: { 'x-test-role': papel, 'x-empresa-id': 'empresa-alheia' } },
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(paginaTarefas);
      expect(tarefasService.listar).toHaveBeenCalledWith(
        expect.objectContaining({
          q: 'revisar',
          status: 'pendente',
          page: 1,
          pageSize: 20,
        }),
        empresaId,
      );
    },
  );

  it('lista tarefas por unidade por HTTP', async () => {
    const response = await fetch(
      `${baseUrl}/api/v1/unidades/${unidadeId}/tarefas?status=em_andamento`,
      { headers: { 'x-test-role': 'gestor' } },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(paginaTarefas);
    expect(tarefasService.listarPorUnidade).toHaveBeenCalledWith(
      unidadeId,
      expect.objectContaining({ status: 'em_andamento' }),
      empresaId,
    );
  });

  it('obtém uma tarefa por HTTP para usuário autenticado', async () => {
    const response = await fetch(`${baseUrl}/api/v1/tarefas/${tarefaId}`, {
      headers: { 'x-test-role': 'colaborador' },
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(tarefaDto);
    expect(tarefasService.obter).toHaveBeenCalledWith(tarefaId, empresaId);
  });

  it('exige autenticação para consultar tarefas', async () => {
    const response = await fetch(`${baseUrl}/api/v1/tarefas`);

    expect(response.status).toBe(401);
    expect(tarefasService.listar).not.toHaveBeenCalled();
  });

  it('rejeita UUID inválido e filtros desconhecidos', async () => {
    const uuidInvalido = await fetch(`${baseUrl}/api/v1/tarefas/nao-e-uuid`, {
      headers: { 'x-test-role': 'colaborador' },
    });
    expect(uuidInvalido.status).toBe(400);

    const filtroDesconhecido = await fetch(
      `${baseUrl}/api/v1/tarefas?empresaId=${empresaId}`,
      { headers: { 'x-test-role': 'colaborador' } },
    );
    expect(filtroDesconhecido.status).toBe(400);
    expect(tarefasService.obter).not.toHaveBeenCalled();
    expect(tarefasService.listar).not.toHaveBeenCalled();
  });

  it('cria tarefa por HTTP com os campos permitidos', async () => {
    const response = await fetch(
      `${baseUrl}/api/v1/unidades/${unidadeId}/tarefas`,
      {
        method: 'POST',
        headers: {
          'x-frotasync-client': 'web',
          'x-test-role': 'colaborador',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          titulo: 'Revisar documentação',
          descricao: 'Conferir documentos pendentes',
          prazoFinal: '2026-12-15',
        }),
      },
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(tarefaDto);
    expect(tarefasService.criar).toHaveBeenCalledWith(
      unidadeId,
      {
        titulo: 'Revisar documentação',
        descricao: 'Conferir documentos pendentes',
        prazoFinal: '2026-12-15',
      },
      empresaId,
    );
  });

  it('rejeita criação HTTP sem prazo final', async () => {
    const response = await fetch(
      `${baseUrl}/api/v1/unidades/${unidadeId}/tarefas`,
      {
        method: 'POST',
        headers: {
          'x-frotasync-client': 'web',
          'x-test-role': 'colaborador',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ titulo: 'Revisar documentação' }),
      },
    );

    expect(response.status).toBe(400);
    expect(tarefasService.criar).not.toHaveBeenCalled();
  });

  it.each(['gestor', 'administrador'])(
    'nega criação HTTP ao perfil %s',
    async (papel) => {
      const response = await fetch(
        `${baseUrl}/api/v1/unidades/${unidadeId}/tarefas`,
        {
          method: 'POST',
          headers: {
            'x-frotasync-client': 'web',
            'x-test-role': papel,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            titulo: 'Revisar documentação',
            prazoFinal: '2026-12-15',
          }),
        },
      );

      expect(response.status).toBe(403);
      expect(tarefasService.criar).not.toHaveBeenCalled();
    },
  );

  it('atualiza tarefa por HTTP', async () => {
    const response = await fetch(`${baseUrl}/api/v1/tarefas/${tarefaId}`, {
      method: 'PUT',
      headers: {
        'x-frotasync-client': 'web',
        'x-test-role': 'colaborador',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        titulo: 'Atualizar documentação',
        prazoFinal: '2026-12-20',
      }),
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(tarefaDto);
    expect(tarefasService.atualizar).toHaveBeenCalledWith(
      tarefaId,
      {
        titulo: 'Atualizar documentação',
        prazoFinal: '2026-12-20',
      },
      empresaId,
    );
  });

  it('rejeita atualização HTTP com corpo vazio', async () => {
    const response = await fetch(`${baseUrl}/api/v1/tarefas/${tarefaId}`, {
      method: 'PUT',
      headers: {
        'x-frotasync-client': 'web',
        'x-test-role': 'colaborador',
        'content-type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(400);
    expect(tarefasService.atualizar).not.toHaveBeenCalled();
  });

  it('altera status por HTTP com confirmação explícita de conclusão', async () => {
    const response = await fetch(
      `${baseUrl}/api/v1/tarefas/${tarefaId}/status`,
      {
        method: 'PATCH',
        headers: {
          'x-frotasync-client': 'web',
          'x-test-role': 'colaborador',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          status: 'concluida',
          confirmacao: true,
        }),
      },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      id: tarefaId,
      status: 'concluida',
      dataConclusao: '2026-11-23T12:00:00.000Z',
    });
    expect(tarefasService.atualizarStatus).toHaveBeenCalledWith(
      tarefaId,
      { status: 'concluida', confirmacao: true },
      empresaId,
    );
  });

  it('rejeita conclusão HTTP sem confirmação', async () => {
    const response = await fetch(
      `${baseUrl}/api/v1/tarefas/${tarefaId}/status`,
      {
        method: 'PATCH',
        headers: {
          'x-frotasync-client': 'web',
          'x-test-role': 'colaborador',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ status: 'concluida' }),
      },
    );

    expect(response.status).toBe(400);
    expect(tarefasService.atualizarStatus).not.toHaveBeenCalled();
  });

  it.each(['gestor', 'administrador'])(
    'nega alteração de status HTTP ao perfil %s',
    async (papel) => {
      const response = await fetch(
        `${baseUrl}/api/v1/tarefas/${tarefaId}/status`,
        {
          method: 'PATCH',
          headers: {
            'x-frotasync-client': 'web',
            'x-test-role': papel,
            'content-type': 'application/json',
          },
          body: JSON.stringify({ status: 'em_andamento' }),
        },
      );

      expect(response.status).toBe(403);
      expect(tarefasService.atualizarStatus).not.toHaveBeenCalled();
    },
  );

  it('retorna 204 após exclusão pelo gestor autenticado', async () => {
    const response = await fetch(`${baseUrl}/api/v1/tarefas/${tarefaId}`, {
      method: 'DELETE',
      headers: { 'x-frotasync-client': 'web', 'x-test-role': 'gestor' },
    });

    expect(response.status).toBe(204);
    expect(await response.text()).toBe('');
    expect(tarefasService.excluir).toHaveBeenCalledWith(tarefaId, empresaId);
  });

  it.each(['colaborador', 'administrador'])(
    'nega exclusão HTTP ao perfil %s',
    async (papel) => {
      const response = await fetch(`${baseUrl}/api/v1/tarefas/${tarefaId}`, {
        method: 'DELETE',
        headers: { 'x-frotasync-client': 'web', 'x-test-role': papel },
      });

      expect(response.status).toBe(403);
      expect(tarefasService.excluir).not.toHaveBeenCalled();
    },
  );
});
