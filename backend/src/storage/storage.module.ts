import { Module } from '@nestjs/common';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { STORAGE_PROVIDER } from './interfaces/storage.interface';
import { StorageService } from './storage.service';

@Module({
  providers: [
    LocalStorageProvider,
    {
      provide: STORAGE_PROVIDER,
      useExisting: LocalStorageProvider,
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}
