import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UnidadesService } from './unidades.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  ListarUnidadesDto,
  ListarUnidadesSchema,
} from './schemas/listar-unidades.schema';
import {
  CriarUnidadeDto,
  CriarUnidadeSchema,
} from './schemas/criar-unidade.schema';
import {
  AtualizarUnidadeDto,
  AtualizarUnidadeSchema,
} from './schemas/atualizar-unidade.schema';
import {
  AtualizarStatusUnidadeDto,
  AtualizarStatusUnidadeSchema,
} from './schemas/atualizar-status-unidade.schema';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('unidades')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('colaborador', 'gestor', 'administrador')
export class UnidadesController {
  constructor(private readonly unidadesService: UnidadesService) {}

  @Post()
  @Roles('administrador')
  criar(
    @Body(new ZodValidationPipe(CriarUnidadeSchema))
    dados: CriarUnidadeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.unidadesService.criar(
      dados,
      req.user.empresaId,
      req.user.id,
    );
  }

  @Put(':id')
  @Roles('administrador')
  atualizar(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(AtualizarUnidadeSchema))
    dados: AtualizarUnidadeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.unidadesService.atualizar(
      id,
      dados,
      req.user.empresaId,
      req.user.id,
    );
  }

  @Patch(':id/status')
  @Roles('administrador')
  atualizarStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(AtualizarStatusUnidadeSchema))
    dados: AtualizarStatusUnidadeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.unidadesService.atualizarStatus(
      id,
      dados.status,
      req.user.empresaId,
      req.user.id,
    );
  }

  @Get(':id')
  obter(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.unidadesService.obter(id, req.user.empresaId);
  }

  @Get()
  listar(
    @Query(new ZodValidationPipe(ListarUnidadesSchema))
    filtros: ListarUnidadesDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.unidadesService.listar(filtros, req.user.empresaId);
  }
}
