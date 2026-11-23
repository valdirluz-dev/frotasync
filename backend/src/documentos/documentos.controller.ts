import {
  ArgumentMetadata,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  PipeTransform,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
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
  ListarDocumentosDto,
  ListarDocumentosSchema,
} from './schemas/listar-documentos.schema';
import { DocumentosService } from './documentos.service';

class NormalizarDataEmissaoVaziaPipe implements PipeTransform {
  transform(value: unknown, _metadata: ArgumentMetadata): unknown {
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
@UseGuards(JwtAuthGuard, RolesGuard)
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
}
