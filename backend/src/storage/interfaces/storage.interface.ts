export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');

export interface StorageSaveInput {
  buffer: Buffer;
  mimeType: string;
}

export interface StorageReadResult {
  buffer: Buffer;
  mimeType: string;
  size: number;
}

export interface Storage {
  save(input: StorageSaveInput): Promise<string>;
  read(key: string): Promise<StorageReadResult>;
  delete(key: string): Promise<void>;
}
