import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UnidadesService } from './unidades.service';
import { UnidadesController } from './unidades.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [UnidadesService],
  exports: [UnidadesService],
  controllers: [UnidadesController],
})
export class UnidadesModule {}
