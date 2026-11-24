import {
  ArgumentMetadata,
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
  HttpStatus,
  ParseUUIDPipe,
  PipeTransform,
  RequestMethod,
} from '@nestjs/common';
import {
  GUARDS_METADATA,
  HTTP_CODE_METADATA,
  INTERCEPTORS_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
  ROUTE_ARGS_METADATA,
} from '@nestjs/common/constants';
import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import type { Response } from 'express';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AnexoUploadInterceptor } from './interceptors/anexo-upload.interceptor';
import {
  AnexoUploadFile,
  AnexoValidationPipe,
} from './pipes/anexo-validation.pipe';
import type { StorageReadResult } from '../storage/interfaces/storage.interface';
import { AtualizarDocumentoDto } from './schemas/atualizar-documento.schema';
import { CriarDocumentoDto } from './schemas/criar-documento.schema';
import { ListarDocumentosDto } from './schemas/listar-documentos.schema';
import { DocumentosController } from './documentos.controller';
import { DocumentosService } from './documentos.service';

type ServiceResponse = {
  items: unknown[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const documentosService = {
  listar:
    jest.fn<
      (
        filtros: ListarDocumentosDto,
        empresaId: string,
      ) => Promise<ServiceResponse>
    >(),
  listarPorUnidade:
    jest.fn<
      (
        unidadeId: string,
        filtros: ListarDocumentosDto,
        empresaId: string,
      ) => Promise<ServiceResponse>
    >(),
  listarCategorias: jest.fn<(empresaId: string) => Promise<string[]>>(),
  obter: jest.fn<(id: string, empresaId: string) => Promise<unknown>>(),
  criar:
    jest.fn<
      (
        unidadeId: string,
        documento: CriarDocumentoDto,
        anexo: AnexoUploadFile,
        empresaId: string,
      ) => Promise<unknown>
    >(),
  atualizar:
    jest.fn<
      (
        id: string,
        documento: AtualizarDocumentoDto,
        anexo: AnexoUploadFile | undefined,
        empresaId: string,
      ) => Promise<unknown>
    >(),
  baixarAnexo:
    jest.fn<
      (
        id: string,
        empresaId: string,
      ) => Promise<StorageReadResult & { fileName: string }>
    >(),
  excluir: jest.fn<(id: string, empresaId: string) => Promise<void>>(),
};

const req = {
  user: {
    id: 'usuario-1',
    email: 'colaborador@example.com',
    papel: 'colaborador',
    empresaId: 'empresa-123',
  },
} as AuthenticatedRequest;

const resposta: ServiceResponse = {
  items: [],
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 1,
};

const documentoCriar: CriarDocumentoDto = {
  nome: 'Licença Ambiental',
  categoria: 'Ambiental',
  dataEmissao: undefined,
  dataValidade: '2026-06-30',
};

const documentoAtualizar: AtualizarDocumentoDto = {
  nome: 'Licença revisada',
};

const anexo: AnexoUploadFile = {
  originalname: 'licenca.pdf',
  buffer: Buffer.from('%PDF-1.7\nconteúdo'),
  mimetype: 'application/pdf',
  size: Buffer.byteLength('%PDF-1.7\nconteúdo'),
};

let controller: DocumentosController;

function obterPipeDeQuery(metodo: string): ZodValidationPipe {
  const argumentos = Reflect.getMetadata(
    ROUTE_ARGS_METADATA,
    DocumentosController,
    metodo,
  ) as Record<string, { pipes?: unknown[] }>;

  const argumentoComPipe = Object.values(argumentos).find((argumento) =>
    argumento.pipes?.some((pipe) => pipe instanceof ZodValidationPipe),
  );
  const pipe = argumentoComPipe?.pipes?.find(
    (item) => item instanceof ZodValidationPipe,
  );

  if (!(pipe instanceof ZodValidationPipe)) {
    throw new Error(`ZodValidationPipe não encontrado no método ${metodo}.`);
  }

  return pipe;
}

function obterArgumentosDoMetodo(
  metodo: string,
): Record<string, { pipes?: unknown[] }> {
  return Reflect.getMetadata(
    ROUTE_ARGS_METADATA,
    DocumentosController,
    metodo,
  ) as Record<string, { pipes?: unknown[] }>;
}

function aplicarPipes(pipes: unknown[], valor: unknown): unknown {
  return pipes.reduce((atual, pipe) => {
    if (
      typeof pipe === 'object' &&
      pipe !== null &&
      'transform' in pipe &&
      typeof pipe.transform === 'function'
    ) {
      return (pipe as PipeTransform).transform(atual, {} as ArgumentMetadata);
    }

    return atual;
  }, valor);
}

function criarContextoComPapel(
  handler: unknown,
  papel: string,
): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass: () => DocumentosController,
    switchToHttp: () => ({
      getRequest: () => ({ user: { papel } }),
    }),
  } as unknown as ExecutionContext;
}

describe('DocumentosController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    controller = new DocumentosController(
      documentosService as unknown as DocumentosService,
    );
  });

  it('deve delegar a listagem global com filtros e empresa autenticada', async () => {
    documentosService.listar.mockResolvedValue(resposta);
    const filtros: ListarDocumentosDto = {
      q: 'Alvará',
      page: 2,
      pageSize: 10,
    };

    await expect(controller.listar(filtros, req)).resolves.toBe(resposta);
    expect(documentosService.listar).toHaveBeenCalledWith(
      filtros,
      'empresa-123',
    );
  });

  it('deve delegar a listagem por unidade com filtros e empresa autenticada', async () => {
    documentosService.listarPorUnidade.mockResolvedValue(resposta);
    const filtros: ListarDocumentosDto = {
      categoria: 'Legal',
      page: 1,
      pageSize: 20,
    };

    await expect(
      controller.listarPorUnidade('unidade-123', filtros, req),
    ).resolves.toBe(resposta);
    expect(documentosService.listarPorUnidade).toHaveBeenCalledWith(
      'unidade-123',
      filtros,
      'empresa-123',
    );
  });

  it('deve delegar a consulta individual com ID e empresa autenticada', async () => {
    const resultado = { id: 'documento-1' };
    documentosService.obter.mockResolvedValue(resultado);

    await expect(
      controller.obter('a0cd295f-5787-493b-a3d0-c85029a75fc8', req),
    ).resolves.toBe(resultado);
    expect(documentosService.obter).toHaveBeenCalledWith(
      'a0cd295f-5787-493b-a3d0-c85029a75fc8',
      'empresa-123',
    );
  });

  it('deve delegar a listagem de categorias com a empresa autenticada', async () => {
    const categorias = ['Ambiental', 'Legal'];
    documentosService.listarCategorias.mockResolvedValue(categorias);

    await expect(controller.listarCategorias(req)).resolves.toBe(categorias);
    expect(documentosService.listarCategorias).toHaveBeenCalledWith(
      'empresa-123',
    );
  });

  it('deve delegar a criação com unidade, dados, anexo e empresa autenticada', async () => {
    const resultado = { id: 'documento-1' };
    documentosService.criar.mockResolvedValue(resultado);

    await expect(
      controller.criar(
        'd9428888-122b-4b42-9acc-2a83c47b3f6e',
        documentoCriar,
        anexo,
        req,
      ),
    ).resolves.toBe(resultado);
    expect(documentosService.criar).toHaveBeenCalledWith(
      'd9428888-122b-4b42-9acc-2a83c47b3f6e',
      documentoCriar,
      anexo,
      'empresa-123',
    );
  });

  it('deve delegar atualização parcial sem arquivo e com empresa autenticada', async () => {
    const resultado = { id: 'documento-1' };
    documentosService.atualizar.mockResolvedValue(resultado);

    await expect(
      controller.atualizar(
        'a0cd295f-5787-493b-a3d0-c85029a75fc8',
        documentoAtualizar,
        undefined,
        req,
      ),
    ).resolves.toBe(resultado);
    expect(documentosService.atualizar).toHaveBeenCalledWith(
      'a0cd295f-5787-493b-a3d0-c85029a75fc8',
      documentoAtualizar,
      undefined,
      'empresa-123',
    );
  });

  it('deve enviar o binário do anexo com MIME e cabeçalhos corretos', async () => {
    const buffer = Buffer.from([0x00, 0xff, 0x25, 0x50, 0x44, 0x46]);
    documentosService.baixarAnexo.mockResolvedValue({
      buffer,
      mimeType: 'application/pdf',
      size: buffer.byteLength,
      fileName: 'licença final.pdf',
    });
    const response = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    await controller.baixarAnexo(
      'a0cd295f-5787-493b-a3d0-c85029a75fc8',
      req,
      response as unknown as Response,
    );

    expect(documentosService.baixarAnexo).toHaveBeenCalledWith(
      'a0cd295f-5787-493b-a3d0-c85029a75fc8',
      'empresa-123',
    );
    expect(response.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/pdf',
    );
    expect(response.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      `inline; filename="licen_a final.pdf"; filename*=UTF-8''licen%C3%A7a%20final.pdf`,
    );
    expect(response.setHeader).toHaveBeenCalledWith(
      'Content-Length',
      buffer.byteLength,
    );
    expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
    expect(response.send).toHaveBeenCalledWith(buffer);
  });

  it('sanitiza o nome do anexo para impedir injeção de cabeçalhos', async () => {
    documentosService.baixarAnexo.mockResolvedValue({
      buffer: Buffer.from('%PDF-1.7'),
      mimeType: 'application/pdf',
      size: 8,
      fileName: '../nome"\r\nX-Injection: yes.pdf',
    });
    const response = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    await controller.baixarAnexo(
      'a0cd295f-5787-493b-a3d0-c85029a75fc8',
      req,
      response as unknown as Response,
    );

    const disposition = response.setHeader.mock.calls.find(
      ([header]) => header === 'Content-Disposition',
    )?.[1] as string;
    expect(disposition).toContain(
      'inline; filename="nome___X-Injection: yes.pdf"',
    );
    expect(disposition).not.toMatch(/[\r\n]/);
  });

  it('deve validar as queries dos dois endpoints pelo ZodValidationPipe', () => {
    for (const metodo of ['listar', 'listarPorUnidade']) {
      const pipe = obterPipeDeQuery(metodo);
      const filtros = pipe.transform(
        { page: '2', pageSize: '10' },
        {} as ArgumentMetadata,
      );

      expect(filtros).toEqual({
        page: 2,
        pageSize: 10,
      });
      expect(() =>
        pipe.transform({ status: 'ativa' }, {} as ArgumentMetadata),
      ).toThrow(BadRequestException);
    }
  });

  it('deve normalizar dataEmissao vazia e validar o corpo pelo schema Zod', () => {
    const argumentos = Object.values(obterArgumentosDoMetodo('criar'));
    const argumentoDoCorpo = argumentos.find((argumento) =>
      argumento.pipes?.some((pipe) => pipe instanceof ZodValidationPipe),
    );

    expect(argumentoDoCorpo).toBeDefined();
    const pipes = argumentoDoCorpo?.pipes ?? [];
    const corpo = {
      nome: '  Licença Ambiental  ',
      categoria: 'Ambiental',
      dataEmissao: '',
      dataValidade: '2026-06-30',
    };

    expect(aplicarPipes(pipes, corpo)).toEqual({
      nome: 'Licença Ambiental',
      categoria: 'Ambiental',
      dataEmissao: undefined,
      dataValidade: '2026-06-30',
    });
    expect(() =>
      aplicarPipes(pipes, { ...corpo, statusValidade: 'valido' }),
    ).toThrow(BadRequestException);
  });

  it('deve validar body parcial, normalizar dataEmissao vazia e rejeitar campos desconhecidos', async () => {
    const argumentos = Object.values(obterArgumentosDoMetodo('atualizar'));
    const argumentoDoCorpo = argumentos.find((argumento) =>
      argumento.pipes?.some((pipe) => pipe instanceof ZodValidationPipe),
    );
    const pipes = argumentoDoCorpo?.pipes ?? [];
    const pipeUuid = argumentos
      .flatMap((argumento) => argumento.pipes ?? [])
      .find((pipe) => pipe instanceof ParseUUIDPipe);

    expect(
      aplicarPipes(pipes, { nome: '  Novo nome  ', dataEmissao: '' }),
    ).toEqual({ nome: 'Novo nome', dataEmissao: undefined });
    expect(aplicarPipes(pipes, {})).toEqual({});
    expect(() => aplicarPipes(pipes, { statusValidade: 'valido' })).toThrow(
      BadRequestException,
    );
    expect(() =>
      aplicarPipes(pipes, {
        unidadeId: 'd9428888-122b-4b42-9acc-2a83c47b3f6e',
      }),
    ).toThrow(BadRequestException);
    expect(() => aplicarPipes(pipes, { campoExtra: true })).toThrow(
      BadRequestException,
    );
    await expect(
      (pipeUuid as ParseUUIDPipe).transform(
        'nao-e-uuid',
        {} as ArgumentMetadata,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve validar o UUID da unidade e exigir um anexo válido', async () => {
    const argumentos = Object.values(obterArgumentosDoMetodo('criar'));
    const pipeUuid = argumentos
      .flatMap((argumento) => argumento.pipes ?? [])
      .find((pipe) => pipe instanceof ParseUUIDPipe);
    const pipeAnexo = argumentos
      .flatMap((argumento) => argumento.pipes ?? [])
      .find((pipe) => pipe instanceof AnexoValidationPipe);

    expect(pipeUuid).toBeInstanceOf(ParseUUIDPipe);
    await expect(
      (pipeUuid as ParseUUIDPipe).transform(
        'nao-e-uuid',
        {} as ArgumentMetadata,
      ),
    ).rejects.toThrow(BadRequestException);
    expect(pipeAnexo).toBeInstanceOf(AnexoValidationPipe);
    expect(
      (pipeAnexo as AnexoValidationPipe).transform(
        anexo,
        {} as ArgumentMetadata,
      ),
    ).toBe(anexo);
    expect(() =>
      (pipeAnexo as AnexoValidationPipe).transform(
        undefined,
        {} as ArgumentMetadata,
      ),
    ).toThrow(BadRequestException);
  });

  it('deve aceitar body vazio somente quando há anexo válido', async () => {
    const resultado = { id: 'documento-1' };
    documentosService.atualizar.mockResolvedValue(resultado);
    const argumentos = Object.values(obterArgumentosDoMetodo('atualizar'));
    const pipes = argumentos.flatMap((argumento) => argumento.pipes ?? []);
    const pipeDoCorpo = pipes.filter(
      (pipe) => pipe instanceof ZodValidationPipe,
    );
    const pipeDoAnexo = pipes.find(
      (pipe) => pipe instanceof AnexoValidationPipe,
    );
    expect(pipeDoAnexo).toBeInstanceOf(AnexoValidationPipe);
    expect(
      (pipeDoAnexo as AnexoValidationPipe).transform(
        undefined,
        {} as ArgumentMetadata,
      ),
    ).toBeUndefined();
    expect(
      (pipeDoAnexo as AnexoValidationPipe).transform(
        anexo,
        {} as ArgumentMetadata,
      ),
    ).toBe(anexo);

    const documento = aplicarPipes(pipeDoCorpo, {});
    await expect(
      controller.atualizar(
        'a0cd295f-5787-493b-a3d0-c85029a75fc8',
        documento as AtualizarDocumentoDto,
        anexo,
        req,
      ),
    ).resolves.toBe(resultado);
    expect(documentosService.atualizar).toHaveBeenCalledWith(
      'a0cd295f-5787-493b-a3d0-c85029a75fc8',
      {},
      anexo,
      'empresa-123',
    );
  });

  it('propaga a rejeição do service para body vazio sem arquivo', async () => {
    const erro = new BadRequestException(
      'Informe ao menos um campo ou um novo anexo para atualizar.',
    );
    documentosService.atualizar.mockRejectedValue(erro);

    await expect(
      controller.atualizar(
        'a0cd295f-5787-493b-a3d0-c85029a75fc8',
        {},
        undefined,
        req,
      ),
    ).rejects.toBe(erro);
    expect(documentosService.atualizar).toHaveBeenCalledWith(
      'a0cd295f-5787-493b-a3d0-c85029a75fc8',
      {},
      undefined,
      'empresa-123',
    );
  });

  it('deve aplicar os guards, perfis e rotas HTTP esperados', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, DocumentosController)).toEqual([
      JwtAuthGuard,
      RolesGuard,
      CsrfGuard,
    ]);
    expect(Reflect.getMetadata(ROLES_KEY, DocumentosController)).toEqual([
      'colaborador',
      'gestor',
      'administrador',
    ]);
    expect(
      Reflect.getMetadata(PATH_METADATA, DocumentosController.prototype.listar),
    ).toBe('documentos');
    expect(
      Reflect.getMetadata(
        METHOD_METADATA,
        DocumentosController.prototype.listar,
      ),
    ).toBe(RequestMethod.GET);
    expect(
      Reflect.getMetadata(
        PATH_METADATA,
        DocumentosController.prototype.listarPorUnidade,
      ),
    ).toBe('unidades/:unidadeId/documentos');
    expect(
      Reflect.getMetadata(
        METHOD_METADATA,
        DocumentosController.prototype.listarPorUnidade,
      ),
    ).toBe(RequestMethod.GET);
    expect(
      Reflect.getMetadata(
        PATH_METADATA,
        DocumentosController.prototype.listarCategorias,
      ),
    ).toBe('documentos/categorias');
    expect(
      Reflect.getMetadata(
        METHOD_METADATA,
        DocumentosController.prototype.listarCategorias,
      ),
    ).toBe(RequestMethod.GET);
    expect(
      Reflect.getMetadata(
        ROLES_KEY,
        DocumentosController.prototype.listarCategorias,
      ),
    ).toBeUndefined();
    expect(
      Reflect.getMetadata(PATH_METADATA, DocumentosController.prototype.obter),
    ).toBe('documentos/:id');
    expect(
      Reflect.getMetadata(
        METHOD_METADATA,
        DocumentosController.prototype.obter,
      ),
    ).toBe(RequestMethod.GET);
    const argumentosObter = Object.values(
      obterArgumentosDoMetodo('obter'),
    ).flatMap((argumento) => argumento.pipes ?? []);
    expect(argumentosObter).toContainEqual(expect.any(ParseUUIDPipe));
    expect(
      Reflect.getMetadata(ROLES_KEY, DocumentosController.prototype.obter),
    ).toBeUndefined();
    expect(
      Reflect.getMetadata(PATH_METADATA, DocumentosController.prototype.criar),
    ).toBe('unidades/:unidadeId/documentos');
    expect(
      Reflect.getMetadata(
        METHOD_METADATA,
        DocumentosController.prototype.criar,
      ),
    ).toBe(RequestMethod.POST);
    expect(
      Reflect.getMetadata(ROLES_KEY, DocumentosController.prototype.criar),
    ).toEqual(['colaborador']);
    expect(
      Reflect.getMetadata(
        INTERCEPTORS_METADATA,
        DocumentosController.prototype.criar,
      ),
    ).toContain(AnexoUploadInterceptor);
    expect(
      Reflect.getMetadata(
        PATH_METADATA,
        DocumentosController.prototype.atualizar,
      ),
    ).toBe('documentos/:id');
    expect(
      Reflect.getMetadata(
        METHOD_METADATA,
        DocumentosController.prototype.atualizar,
      ),
    ).toBe(RequestMethod.PUT);
    expect(
      Reflect.getMetadata(ROLES_KEY, DocumentosController.prototype.atualizar),
    ).toEqual(['colaborador']);
    expect(
      Reflect.getMetadata(
        INTERCEPTORS_METADATA,
        DocumentosController.prototype.atualizar,
      ),
    ).toContain(AnexoUploadInterceptor);
    expect(
      Reflect.getMetadata(
        PATH_METADATA,
        DocumentosController.prototype.baixarAnexo,
      ),
    ).toBe('documentos/:id/anexo');
    expect(
      Reflect.getMetadata(
        METHOD_METADATA,
        DocumentosController.prototype.baixarAnexo,
      ),
    ).toBe(RequestMethod.GET);
    expect(
      Reflect.getMetadata(
        ROLES_KEY,
        DocumentosController.prototype.baixarAnexo,
      ),
    ).toBeUndefined();
    expect(
      Reflect.getMetadata(
        PATH_METADATA,
        DocumentosController.prototype.excluir,
      ),
    ).toBe('documentos/:id');
    expect(
      Reflect.getMetadata(
        METHOD_METADATA,
        DocumentosController.prototype.excluir,
      ),
    ).toBe(RequestMethod.DELETE);
    expect(
      Reflect.getMetadata(ROLES_KEY, DocumentosController.prototype.excluir),
    ).toEqual(['gestor']);
    expect(
      Reflect.getMetadata(
        HTTP_CODE_METADATA,
        DocumentosController.prototype.excluir,
      ),
    ).toBe(HttpStatus.NO_CONTENT);
  });

  it('permite download aos perfis autenticados e exclusão somente ao gestor', () => {
    const guard = new RolesGuard(new Reflector());

    for (const papel of ['colaborador', 'gestor', 'administrador']) {
      expect(
        guard.canActivate(
          criarContextoComPapel(
            DocumentosController.prototype.baixarAnexo,
            papel,
          ),
        ),
      ).toBe(true);
      expect(
        guard.canActivate(
          criarContextoComPapel(DocumentosController.prototype.obter, papel),
        ),
      ).toBe(true);
      expect(
        guard.canActivate(
          criarContextoComPapel(
            DocumentosController.prototype.listarCategorias,
            papel,
          ),
        ),
      ).toBe(true);
    }

    expect(
      guard.canActivate(
        criarContextoComPapel(DocumentosController.prototype.excluir, 'gestor'),
      ),
    ).toBe(true);
    expect(() =>
      guard.canActivate(
        criarContextoComPapel(
          DocumentosController.prototype.excluir,
          'colaborador',
        ),
      ),
    ).toThrow(ForbiddenException);
    expect(() =>
      guard.canActivate(
        criarContextoComPapel(
          DocumentosController.prototype.excluir,
          'administrador',
        ),
      ),
    ).toThrow(ForbiddenException);
  });

  it('deve propagar erros do service sem alterá-los', async () => {
    const erro = new BadRequestException('Filtros inválidos');
    documentosService.listar.mockRejectedValue(erro);

    await expect(
      controller.listar({ page: 1, pageSize: 20 }, req),
    ).rejects.toBe(erro);
  });

  it('deve propagar erros do service na listagem por unidade', async () => {
    const erro = new BadRequestException('Unidade inválida');
    documentosService.listarPorUnidade.mockRejectedValue(erro);

    await expect(
      controller.listarPorUnidade(
        'unidade-123',
        { page: 1, pageSize: 20 },
        req,
      ),
    ).rejects.toBe(erro);
  });

  it('deve propagar erro do service na consulta individual', async () => {
    const erro = new BadRequestException('Consulta inválida');
    documentosService.obter.mockRejectedValue(erro);

    await expect(
      controller.obter('a0cd295f-5787-493b-a3d0-c85029a75fc8', req),
    ).rejects.toBe(erro);
  });

  it('deve propagar erro do service ao listar categorias', async () => {
    const erro = new BadRequestException('Consulta inválida');
    documentosService.listarCategorias.mockRejectedValue(erro);

    await expect(controller.listarCategorias(req)).rejects.toBe(erro);
  });

  it('deve propagar erros do service na criação', async () => {
    const erro = new BadRequestException('Unidade inativa');
    documentosService.criar.mockRejectedValue(erro);

    await expect(
      controller.criar(
        'd9428888-122b-4b42-9acc-2a83c47b3f6e',
        documentoCriar,
        anexo,
        req,
      ),
    ).rejects.toBe(erro);
  });

  it('deve propagar erros do service na atualização', async () => {
    const erro = new BadRequestException('Atualização inválida');
    documentosService.atualizar.mockRejectedValue(erro);

    await expect(
      controller.atualizar(
        'a0cd295f-5787-493b-a3d0-c85029a75fc8',
        documentoAtualizar,
        undefined,
        req,
      ),
    ).rejects.toBe(erro);
  });

  it('deve delegar exclusão com ID e empresa autenticada', async () => {
    documentosService.excluir.mockResolvedValue();

    await expect(
      controller.excluir('a0cd295f-5787-493b-a3d0-c85029a75fc8', req),
    ).resolves.toBeUndefined();
    expect(documentosService.excluir).toHaveBeenCalledWith(
      'a0cd295f-5787-493b-a3d0-c85029a75fc8',
      'empresa-123',
    );
  });

  it('propaga erros do service ao baixar e excluir', async () => {
    const erro = new BadRequestException('Storage indisponível');
    documentosService.baixarAnexo.mockRejectedValue(erro);
    documentosService.excluir.mockRejectedValue(erro);
    const response = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    await expect(
      controller.baixarAnexo(
        'a0cd295f-5787-493b-a3d0-c85029a75fc8',
        req,
        response as unknown as Response,
      ),
    ).rejects.toBe(erro);
    await expect(
      controller.excluir('a0cd295f-5787-493b-a3d0-c85029a75fc8', req),
    ).rejects.toBe(erro);
    expect(response.send).not.toHaveBeenCalled();
  });
});
