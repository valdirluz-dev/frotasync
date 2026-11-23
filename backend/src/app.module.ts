import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UnidadesModule } from './unidades/unidades.module';
import { StorageModule } from './storage/storage.module';
import { DocumentosModule } from './documentos/documentos.module';
import { TarefasModule } from './tarefas/tarefas.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    PrismaModule,
    AuthModule,
    UnidadesModule,
    DocumentosModule,
    TarefasModule,
    StorageModule,
  ],
})
export class AppModule {}
