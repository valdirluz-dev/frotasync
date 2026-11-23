import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { DashboardService } from './dashboard.service';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('colaborador', 'gestor', 'administrador')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('dashboard/indicadores')
  obterIndicadores(@Req() req: AuthenticatedRequest) {
    return this.dashboardService.obterIndicadores(req.user.empresaId);
  }

  @Get('unidades/:id/indicadores')
  obterIndicadoresUnidade(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.dashboardService.obterIndicadoresUnidade(
      id,
      req.user.empresaId,
    );
  }
}
