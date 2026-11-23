import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UnidadesService } from './unidades.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  ListarUnidadesDto,
  ListarUnidadesSchema,
} from './schemas/listar-unidades.schema';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('unidades')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('colaborador', 'gestor', 'administrador')
export class UnidadesController {
  constructor(private readonly unidadesService: UnidadesService) {}

  @Get()
  listar(
    @Query(new ZodValidationPipe(ListarUnidadesSchema))
    filtros: ListarUnidadesDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.unidadesService.listar(filtros, req.user.empresaId);
  }
}
