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
  /**
   * Removes the primary content. A rejection other than NotFoundException
   * guarantees that the primary content remains available and unchanged.
   * NotFoundException means the content was already absent. Auxiliary metadata
   * cleanup must not cause rejection after content removal.
   */
  delete(key: string): Promise<void>;
}
