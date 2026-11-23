import { jest } from '@jest/globals';
import { Storage, StorageReadResult } from './interfaces/storage.interface';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  it('provides the storage contract through its injected provider', async () => {
    const result: StorageReadResult = {
      buffer: Buffer.from('content'),
      mimeType: 'application/pdf',
      size: 7,
    };
    const provider: Storage = {
      save: async () => 'storage-key',
      read: async () => result,
      delete: async () => undefined,
    };
    const saveSpy = jest.spyOn(provider, 'save');
    const readSpy = jest.spyOn(provider, 'read');
    const deleteSpy = jest.spyOn(provider, 'delete');
    const service = new StorageService(provider);

    await expect(
      service.save({ buffer: result.buffer, mimeType: result.mimeType }),
    ).resolves.toBe('storage-key');
    await expect(service.read('storage-key')).resolves.toBe(result);
    await expect(service.delete('storage-key')).resolves.toBeUndefined();
    expect(saveSpy).toHaveBeenCalledWith({
      buffer: result.buffer,
      mimeType: result.mimeType,
    });
    expect(readSpy).toHaveBeenCalledWith('storage-key');
    expect(deleteSpy).toHaveBeenCalledWith('storage-key');
  });
});
