import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { TarefasService } from './tarefas.service';
import {
  CriarTarefaDto,
  CriarTarefaSchema,
} from './schemas/criar-tarefa.schema';
import {
  AtualizarTarefaDto,
  AtualizarTarefaSchema,
} from './schemas/atualizar-tarefa.schema';
import {
  AtualizarStatusTarefaDto,
  AtualizarStatusTarefaSchema,
} from './schemas/atualizar-status-tarefa.schema';
import {
  ListarTarefasDto,
  ListarTarefasSchema,
  ListarTarefasPorUnidadeDto,
  ListarTarefasPorUnidadeSchema,
} from './schemas/listar-tarefas.schema';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('colaborador', 'gestor', 'administrador')
export class TarefasController {
  constructor(private readonly tarefasService: TarefasService) {}

  @Get('tarefas')
  listar(
    @Query(new ZodValidationPipe(ListarTarefasSchema))
    filtros: ListarTarefasDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.tarefasService.listar(filtros, req.user.empresaId);
  }

  @Get('unidades/:unidadeId/tarefas')
  listarPorUnidade(
    @Param('unidadeId', new ParseUUIDPipe()) unidadeId: string,
    @Query(new ZodValidationPipe(ListarTarefasPorUnidadeSchema))
    filtros: ListarTarefasPorUnidadeDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.tarefasService.listarPorUnidade(
      unidadeId,
      filtros,
      req.user.empresaId,
    );
  }

  @Get('tarefas/:id')
  obter(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.tarefasService.obter(id, req.user.empresaId);
  }

  @Post('unidades/:unidadeId/tarefas')
  @Roles('colaborador')
  criar(
    @Param('unidadeId', new ParseUUIDPipe()) unidadeId: string,
    @Body(new ZodValidationPipe(CriarTarefaSchema))
    tarefa: CriarTarefaDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.tarefasService.criar(unidadeId, tarefa, req.user.empresaId);
  }

  @Put('tarefas/:id')
  @Roles('colaborador')
  atualizar(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(AtualizarTarefaSchema))
    tarefa: AtualizarTarefaDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.tarefasService.atualizar(id, tarefa, req.user.empresaId);
  }

  @Patch('tarefas/:id/status')
  @Roles('colaborador')
  atualizarStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ZodValidationPipe(AtualizarStatusTarefaSchema))
    dados: AtualizarStatusTarefaDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.tarefasService.atualizarStatus(id, dados, req.user.empresaId);
  }

  @Delete('tarefas/:id')
  @Roles('gestor')
  @HttpCode(HttpStatus.NO_CONTENT)
  async excluir(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthenticatedRequest,
  ): Promise<void> {
    await this.tarefasService.excluir(id, req.user.empresaId);
  }
}
