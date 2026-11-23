import { jest } from '@jest/globals';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  mkdtemp,
  mkdir,
  readFile,
  rm,
  stat,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LocalStorageProvider } from './local-storage.provider';

describe('LocalStorageProvider', () => {
  let temporaryDirectory: string;
  let configService: ConfigService;
  let provider: LocalStorageProvider;

  beforeEach(async () => {
    temporaryDirectory = await mkdtemp(join(tmpdir(), 'frotasync-storage-'));
    configService = {
      get: jest.fn().mockReturnValue(temporaryDirectory),
    } as unknown as ConfigService;
    provider = new LocalStorageProvider(configService);
  });

  afterEach(async () => {
    await rm(temporaryDirectory, { recursive: true, force: true });
  });

  it('persists a file under the configured directory using an opaque UUID key', async () => {
    const buffer = Buffer.from('document content');

    const key = await provider.save({ buffer, mimeType: 'application/pdf' });

    expect(key).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(await readFile(join(temporaryDirectory, key))).toEqual(buffer);
    expect(configService.get).toHaveBeenCalledWith('STORAGE_LOCAL_PATH');
  });

  it('reads the file buffer, MIME type, and size', async () => {
    const buffer = Buffer.from('file contents');
    const key = await provider.save({ buffer, mimeType: 'image/png' });

    await expect(provider.read(key)).resolves.toEqual({
      buffer,
      mimeType: 'image/png',
      size: buffer.byteLength,
    });
  });

  it('deletes the file and its metadata', async () => {
    const key = await provider.save({
      buffer: Buffer.from('temporary content'),
      mimeType: 'text/plain',
    });

    await provider.delete(key);

    await expect(readFile(join(temporaryDirectory, key))).rejects.toMatchObject(
      { code: 'ENOENT' },
    );
    await expect(
      readFile(join(temporaryDirectory, `${key}.json`)),
    ).rejects.toMatchObject({ code: 'ENOENT' });
  });

  it('throws NotFoundException for files that do not exist', async () => {
    const key = '2e3b6170-759b-4ce0-83c9-f50043d85777';

    await expect(provider.read(key)).rejects.toBeInstanceOf(NotFoundException);
    await expect(provider.delete(key)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('creates the configured directory when saving', async () => {
    const nestedPath = join(temporaryDirectory, 'nested', 'storage');
    configService = {
      get: jest.fn().mockReturnValue(nestedPath),
    } as unknown as ConfigService;
    provider = new LocalStorageProvider(configService);

    await provider.save({
      buffer: Buffer.from('content'),
      mimeType: 'text/plain',
    });

    expect((await stat(nestedPath)).isDirectory()).toBe(true);
  });

  it('uses a default storage directory when no path is configured', async () => {
    const originalWorkingDirectory = process.cwd();
    process.chdir(temporaryDirectory);
    try {
      configService = {
        get: jest.fn().mockReturnValue(undefined),
      } as unknown as ConfigService;
      provider = new LocalStorageProvider(configService);

      const key = await provider.save({
        buffer: Buffer.from('default path'),
        mimeType: 'text/plain',
      });

      expect(await readFile(join(temporaryDirectory, 'storage', key))).toEqual(
        Buffer.from('default path'),
      );
    } finally {
      process.chdir(originalWorkingDirectory);
    }
  });

  it.each(['../outside', '/etc/passwd', 'not-a-uuid'])(
    'rejects invalid storage key %s',
    async (key) => {
      await expect(provider.read(key)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      await expect(provider.delete(key)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    },
  );

  it('rejects a stored file symlink that resolves outside the storage directory', async () => {
    const storagePath = join(temporaryDirectory, 'storage');
    const outsidePath = join(temporaryDirectory, 'outside.txt');
    const key = '2e3b6170-759b-4ce0-83c9-f50043d85777';
    await writeFile(outsidePath, 'outside');
    configService = {
      get: jest.fn().mockReturnValue(storagePath),
    } as unknown as ConfigService;
    provider = new LocalStorageProvider(configService);
    await mkdir(storagePath);
    await symlink(outsidePath, join(storagePath, key));

    await expect(provider.read(key)).rejects.toMatchObject({
      status: 500,
    });
  });
});
