import {
  ArgumentMetadata,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  PipeTransform,
  Post,
  Put,
  Query,
  Res,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
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
import {
  CriarDocumentoDto,
  CriarDocumentoSchema,
} from './schemas/criar-documento.schema';
import {
  AtualizarDocumentoDto,
  AtualizarDocumentoSchema,
} from './schemas/atualizar-documento.schema';
import {
  ListarDocumentosDto,
  ListarDocumentosSchema,
} from './schemas/listar-documentos.schema';
import { DocumentosService } from './documentos.service';

function criarContentDispositionInline(nomeOriginal: string): string {
  const nomeBase = nomeOriginal.replace(/\\/g, '/').split('/').pop() ?? '';
  const nomeSeguro =
    Array.from(nomeBase, (caractere) => {
      const codigo = caractere.charCodeAt(0);
      return codigo < 0x20 || (codigo >= 0x7f && codigo <= 0x9f)
        ? '_'
        : caractere;
    }).join('') || 'anexo';
  const nomeFallback = nomeSeguro
    .replace(/[^\x20-\x7e]/g, '_')
    .replace(/["\\]/g, '_');
  const nomeCodificado = encodeURIComponent(nomeSeguro).replace(
    /[!'()*]/g,
    (caractere) => `%${caractere.charCodeAt(0).toString(16).toUpperCase()}`,
  );

  return `inline; filename="${nomeFallback}"; filename*=UTF-8''${nomeCodificado}`;
}

class NormalizarDataEmissaoVaziaPipe implements PipeTransform {
  transform(value: unknown, _metadata: ArgumentMetadata): unknown {
    if (value === undefined || value === null) {
      return {};
    }

    if (
      typeof value !== 'object' ||
      value === null ||
      Array.isArray(value) ||
      !('dataEmissao' in value) ||
      value.dataEmissao !== ''
    ) {
      return value;
    }

    return { ...value, dataEmissao: undefined };
  }
}

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard, CsrfGuard)
@Roles('colaborador', 'gestor', 'administrador')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Get('documentos')
  listar(
    @Query(new ZodValidationPipe(ListarDocumentosSchema))
    filtros: ListarDocumentosDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.documentosService.listar(filtros, req.user.empresaId);
  }

  @Get('unidades/:unidadeId/documentos')
  listarPorUnidade(
    @Param('unidadeId') unidadeId: string,
    @Query(new ZodValidationPipe(ListarDocumentosSchema))
    filtros: ListarDocumentosDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.documentosService.listarPorUnidade(
      unidadeId,
      filtros,
      req.user.empresaId,
    );
  }

  @Get('documentos/categorias')
  listarCategorias(@Req() req: AuthenticatedRequest) {
    return this.documentosService.listarCategorias(req.user.empresaId);
  }

  @Get('documentos/:id')
  obter(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.documentosService.obter(id, req.user.empresaId);
  }

  @Get('documentos/:id/anexo')
  async baixarAnexo(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
    @Res() response: Response,
  ) {
    const arquivo = await this.documentosService.baixarAnexo(
      id,
      req.user.empresaId,
    );

    response.setHeader('Content-Type', arquivo.mimeType);
    response.setHeader(
      'Content-Disposition',
      criarContentDispositionInline(arquivo.fileName),
    );
    response.setHeader('Content-Length', arquivo.buffer.byteLength);

    return response.status(HttpStatus.OK).send(arquivo.buffer);
  }

  @Post('unidades/:unidadeId/documentos')
  @Roles('colaborador')
  @UseInterceptors(AnexoUploadInterceptor)
  criar(
    @Param('unidadeId', new ParseUUIDPipe()) unidadeId: string,
    @Body(
      new NormalizarDataEmissaoVaziaPipe(),
      new ZodValidationPipe(CriarDocumentoSchema),
    )
    documento: CriarDocumentoDto,
    @UploadedFile(new AnexoValidationPipe()) anexo: AnexoUploadFile,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.documentosService.criar(
      unidadeId,
      documento,
      anexo,
      req.user.empresaId,
    );
  }

  @Put('documentos/:id')
  @Roles('colaborador')
  @UseInterceptors(AnexoUploadInterceptor)
  atualizar(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(
      new NormalizarDataEmissaoVaziaPipe(),
      new ZodValidationPipe(AtualizarDocumentoSchema),
    )
    documento: AtualizarDocumentoDto,
    @UploadedFile(new AnexoValidationPipe(false))
    anexo: AnexoUploadFile | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.documentosService.atualizar(
      id,
      documento,
      anexo,
      req.user.empresaId,
    );
  }

  @Delete('documentos/:id')
  @Roles('gestor')
  @HttpCode(HttpStatus.NO_CONTENT)
  async excluir(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    await this.documentosService.excluir(id, req.user.empresaId);
  }
}
