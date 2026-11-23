import {
  ArgumentMetadata,
  BadRequestException,
  ParseUUIDPipe,
  PipeTransform,
  RequestMethod,
} from '@nestjs/common';
import {
  GUARDS_METADATA,
  INTERCEPTORS_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
  ROUTE_ARGS_METADATA,
} from '@nestjs/common/constants';
import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AnexoUploadInterceptor } from './interceptors/anexo-upload.interceptor';
import {
  AnexoUploadFile,
  AnexoValidationPipe,
} from './pipes/anexo-validation.pipe';
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
  criar:
    jest.fn<
      (
        unidadeId: string,
        documento: CriarDocumentoDto,
        anexo: AnexoUploadFile,
        empresaId: string,
      ) => Promise<unknown>
    >(),
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
  dataValidade: '2026-06-30',
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

  it('deve aplicar os guards, perfis e rotas HTTP esperados', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, DocumentosController)).toEqual([
      JwtAuthGuard,
      RolesGuard,
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
});
