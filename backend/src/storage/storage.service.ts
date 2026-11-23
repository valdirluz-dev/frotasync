import { Inject, Injectable } from '@nestjs/common';
import {
  STORAGE_PROVIDER,
  Storage,
  StorageReadResult,
  StorageSaveInput,
} from './interfaces/storage.interface';

@Injectable()
export class StorageService implements Storage {
  constructor(@Inject(STORAGE_PROVIDER) private readonly storage: Storage) {}

  save(input: StorageSaveInput): Promise<string> {
    return this.storage.save(input);
  }

  read(key: string): Promise<StorageReadResult> {
    return this.storage.read(key);
  }

  delete(key: string): Promise<void> {
    return this.storage.delete(key);
  }
}
