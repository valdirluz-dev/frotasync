import { Module } from '@nestjs/common';
import { UnidadesService } from './unidades.service';

@Module({
  providers: [UnidadesService]
})
export class UnidadesModule {}
