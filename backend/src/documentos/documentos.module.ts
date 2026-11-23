import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { DocumentosController } from './documentos.controller';
import { DocumentosService } from './documentos.service';

@Module({
  imports: [PrismaModule, AuthModule, StorageModule],
  providers: [DocumentosService],
  exports: [DocumentosService],
  controllers: [DocumentosController],
})
export class DocumentosModule {}
