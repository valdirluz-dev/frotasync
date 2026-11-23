import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { TarefasController } from './tarefas.controller';
import { TarefasService } from './tarefas.service';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [TarefasService],
  exports: [TarefasService],
  controllers: [TarefasController],
})
export class TarefasModule {}
