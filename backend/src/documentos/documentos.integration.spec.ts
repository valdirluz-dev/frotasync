import {
  ExecutionContext,
  INestApplication,
  NotFoundException,
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
import { DocumentosController } from './documentos.controller';
import { DocumentosService } from './documentos.service';

const empresaId = 'c3c4a4b7-14ba-4204-a341-7896853621b4';
const unidadeId = 'd9428888-122b-4b42-9acc-2a83c47b3f6e';
const documentoId = 'a0cd295f-5787-493b-a3d0-c85029a75fc8';
const conteudoPdf = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x00, 0xff]);
const documentoDto = {
  id: documentoId,
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
    tamanhoBytes: 482311,
    tipo: 'application/pdf',
    url: `/api/v1/documentos/${documentoId}/anexo`,
  },
  criadoEm: '2026-06-10T10:00:00.000Z',
  atualizadoEm: '2026-06-11T11:00:00.000Z',
} satisfies Awaited<ReturnType<DocumentosService['criar']>>;

const documentosService = {
  criar: jest.fn<DocumentosService['criar']>(),
  atualizar: jest.fn<DocumentosService['atualizar']>(),
  listarCategorias: jest.fn<(empresaId: string) => Promise<string[]>>(),
  obter: jest.fn<(id: string, empresaId: string) => Promise<unknown>>(),
  baixarAnexo: jest.fn<
    (
      id: string,
      empresaId: string,
    ) => Promise<{
      buffer: Buffer;
      mimeType: string;
      size: number;
      fileName: string;
    }>
  >(),
  excluir: jest.fn<(id: string, empresaId: string) => Promise<void>>(),
};

function criarFormularioDocumento({
  incluirAnexo = true,
  mimeType = 'application/pdf',
  conteudo = conteudoPdf,
  nomeArquivo = 'licenca.pdf',
}: {
  incluirAnexo?: boolean;
  mimeType?: string;
  conteudo?: Uint8Array;
  nomeArquivo?: string;
} = {}): FormData {
  const formulario = new FormData();
  formulario.set('nome', 'Licença Ambiental');
  formulario.set('categoria', 'Ambiental');
  formulario.set('dataValidade', '2027-06-30');

  if (incluirAnexo) {
    const bytes = Uint8Array.from(conteudo);
    formulario.set(
      'anexo',
      new Blob([bytes], { type: mimeType }),
      nomeArquivo,
    );
  }

  return formulario;
}

let app: INestApplication;
let baseUrl: string;

describe('Documentos HTTP integration', () => {
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [DocumentosController],
      providers: [
        RolesGuard,
        {
          provide: DocumentosService,
          useValue: documentosService,
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
    documentosService.criar.mockResolvedValue(documentoDto);
    documentosService.atualizar.mockResolvedValue(documentoDto);
    documentosService.listarCategorias.mockResolvedValue([
      'Ambiental',
      'Legal',
    ]);
    documentosService.obter.mockResolvedValue(documentoDto);
    documentosService.baixarAnexo.mockResolvedValue({
      buffer: conteudoPdf,
      mimeType: 'application/pdf',
      size: conteudoPdf.byteLength,
      fileName: 'contrato.pdf',
    });
    documentosService.excluir.mockResolvedValue();
  });

  afterAll(async () => {
    await app.close();
  });

  it('cria documento por HTTP com upload multipart válido', async () => {
    const response = await fetch(
      `${baseUrl}/api/v1/unidades/${unidadeId}/documentos`,
      {
        method: 'POST',
        headers: { 'x-frotasync-client': 'web', 'x-test-role': 'colaborador' },
        body: criarFormularioDocumento(),
      },
    );

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(documentoDto);
    expect(documentosService.criar).toHaveBeenCalledWith(
      unidadeId,
      expect.objectContaining({
        nome: 'Licença Ambiental',
        categoria: 'Ambiental',
        dataValidade: '2027-06-30',
      }),
      expect.objectContaining({
        originalname: 'licenca.pdf',
        mimetype: 'application/pdf',
        size: conteudoPdf.byteLength,
        buffer: expect.any(Buffer),
      }),
      empresaId,
    );
  });

  it('rejeita upload HTTP quando o MIME não corresponde ao tipo permitido', async () => {
    const response = await fetch(
      `${baseUrl}/api/v1/unidades/${unidadeId}/documentos`,
      {
        method: 'POST',
        headers: { 'x-frotasync-client': 'web', 'x-test-role': 'colaborador' },
        body: criarFormularioDocumento({ mimeType: 'text/plain' }),
      },
    );

    expect(response.status).toBe(415);
    expect(documentosService.criar).not.toHaveBeenCalled();
  });

  it('exige anexo na criação HTTP', async () => {
    const response = await fetch(
      `${baseUrl}/api/v1/unidades/${unidadeId}/documentos`,
      {
        method: 'POST',
        headers: { 'x-frotasync-client': 'web', 'x-test-role': 'colaborador' },
        body: criarFormularioDocumento({ incluirAnexo: false }),
      },
    );

    expect(response.status).toBe(400);
    expect(documentosService.criar).not.toHaveBeenCalled();
  });

  it('rejeita upload HTTP acima do limite de 10 MiB', async () => {
    const response = await fetch(
      `${baseUrl}/api/v1/unidades/${unidadeId}/documentos`,
      {
        method: 'POST',
        headers: { 'x-frotasync-client': 'web', 'x-test-role': 'colaborador' },
        body: criarFormularioDocumento({
          conteudo: new Uint8Array(10 * 1024 * 1024 + 1),
        }),
      },
    );

    expect(response.status).toBe(413);
    expect(documentosService.criar).not.toHaveBeenCalled();
  });

  it('atualiza documento por HTTP com substituição multipart do anexo', async () => {
    const response = await fetch(
      `${baseUrl}/api/v1/documentos/${documentoId}`,
      {
        method: 'PUT',
        headers: { 'x-frotasync-client': 'web', 'x-test-role': 'colaborador' },
        body: criarFormularioDocumento(),
      },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(documentoDto);
    expect(documentosService.atualizar).toHaveBeenCalledWith(
      documentoId,
      expect.objectContaining({
        nome: 'Licença Ambiental',
        categoria: 'Ambiental',
        dataValidade: '2027-06-30',
      }),
      expect.objectContaining({
        originalname: 'licenca.pdf',
        mimetype: 'application/pdf',
        size: conteudoPdf.byteLength,
        buffer: expect.any(Buffer),
      }),
      empresaId,
    );
  });

  it('permite atualização HTTP sem substituir o anexo', async () => {
    const response = await fetch(
      `${baseUrl}/api/v1/documentos/${documentoId}`,
      {
        method: 'PUT',
        headers: { 'x-frotasync-client': 'web', 'x-test-role': 'colaborador' },
        body: criarFormularioDocumento({ incluirAnexo: false }),
      },
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(documentoDto);
    expect(documentosService.atualizar).toHaveBeenCalledWith(
      documentoId,
      expect.objectContaining({
        nome: 'Licença Ambiental',
        categoria: 'Ambiental',
        dataValidade: '2027-06-30',
      }),
      undefined,
      empresaId,
    );
  });

  it.each(['colaborador', 'gestor', 'administrador'])(
    'retorna string[] de categorias por HTTP para o perfil %s',
    async (papel) => {
      const response = await fetch(`${baseUrl}/api/v1/documentos/categorias`, {
        headers: { 'x-frotasync-client': 'web', 'x-test-role': papel, 'x-empresa-id': 'empresa-alheia' },
      });

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual(['Ambiental', 'Legal']);
      expect(documentosService.listarCategorias).toHaveBeenCalledWith(
        empresaId,
      );
    },
  );

  it('exige autenticação para listar categorias por HTTP', async () => {
    const response = await fetch(`${baseUrl}/api/v1/documentos/categorias`);

    expect(response.status).toBe(401);
    expect(documentosService.listarCategorias).not.toHaveBeenCalled();
  });

  it.each(['colaborador', 'gestor', 'administrador'])(
    'retorna o DTO de documento por HTTP para o perfil %s',
    async (papel) => {
      const response = await fetch(
        `${baseUrl}/api/v1/documentos/${documentoId}`,
        { headers: { 'x-frotasync-client': 'web', 'x-test-role': papel, 'x-empresa-id': 'empresa-alheia' } },
      );

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toMatchObject({
        id: documentoId,
        statusValidade: 'proximo_vencimento',
        anexo: {
          tamanhoBytes: 482311,
          url: `/api/v1/documentos/${documentoId}/anexo`,
        },
      });
      expect(body).not.toHaveProperty('anexo_url');
      expect(documentosService.obter).toHaveBeenCalledWith(
        documentoId,
        empresaId,
      );
    },
  );

  it('rejeita consulta HTTP sem autenticação e UUID inválido', async () => {
    const semAutenticacao = await fetch(
      `${baseUrl}/api/v1/documentos/${documentoId}`,
    );
    expect(semAutenticacao.status).toBe(401);

    const uuidInvalido = await fetch(
      `${baseUrl}/api/v1/documentos/nao-e-uuid`,
      { headers: { 'x-frotasync-client': 'web', 'x-test-role': 'colaborador' } },
    );
    expect(uuidInvalido.status).toBe(400);
    expect(documentosService.obter).not.toHaveBeenCalled();
  });

  it('retorna 404 HTTP quando o service não encontra documento no escopo', async () => {
    documentosService.obter.mockRejectedValue(
      new NotFoundException({
        message: 'Documento não encontrado.',
        codigo: 'RECURSO_NAO_ENCONTRADO',
      }),
    );

    const response = await fetch(
      `${baseUrl}/api/v1/documentos/${documentoId}`,
      { headers: { 'x-frotasync-client': 'web', 'x-test-role': 'gestor' } },
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({
      codigo: 'RECURSO_NAO_ENCONTRADO',
    });
  });

  it('serve o download binário autenticado com cabeçalhos HTTP', async () => {
    const response = await fetch(
      `${baseUrl}/api/v1/documentos/${documentoId}/anexo`,
      { headers: { 'x-frotasync-client': 'web', 'x-test-role': 'colaborador' } },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/pdf');
    expect(response.headers.get('content-disposition')).toContain(
      'inline; filename="contrato.pdf"',
    );
    expect(Buffer.from(await response.arrayBuffer())).toEqual(conteudoPdf);
    expect(documentosService.baixarAnexo).toHaveBeenCalledWith(
      documentoId,
      empresaId,
    );
  });

  it('retorna 204 após exclusão pelo gestor autenticado', async () => {
    const response = await fetch(
      `${baseUrl}/api/v1/documentos/${documentoId}`,
      {
        method: 'DELETE',
        headers: { 'x-frotasync-client': 'web', 'x-test-role': 'gestor' },
      },
    );

    expect(response.status).toBe(204);
    expect(await response.text()).toBe('');
    expect(documentosService.excluir).toHaveBeenCalledWith(
      documentoId,
      empresaId,
    );
  });

  it.each(['colaborador', 'administrador'])(
    'nega exclusão HTTP ao perfil %s',
    async (papel) => {
      const response = await fetch(
        `${baseUrl}/api/v1/documentos/${documentoId}`,
        {
          method: 'DELETE',
          headers: { 'x-frotasync-client': 'web', 'x-test-role': papel },
        },
      );

      expect(response.status).toBe(403);
      expect(documentosService.excluir).not.toHaveBeenCalled();
    },
  );
});
