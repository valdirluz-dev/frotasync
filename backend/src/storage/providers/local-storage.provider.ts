import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, realpath, unlink, writeFile } from 'node:fs/promises';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import {
  Storage,
  StorageReadResult,
  StorageSaveInput,
} from '../interfaces/storage.interface';

const STORAGE_KEY_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

interface StoredMetadata {
  mimeType: string;
}

@Injectable()
export class LocalStorageProvider implements Storage {
  private readonly storagePath: string;

  constructor(configService: ConfigService) {
    const configuredPath = configService.get<string>('STORAGE_LOCAL_PATH');
    this.storagePath = resolve(
      configuredPath?.trim() || resolve(process.cwd(), 'storage'),
    );
  }

  async save({ buffer, mimeType }: StorageSaveInput): Promise<string> {
    await mkdir(this.storagePath, { recursive: true, mode: 0o700 });

    const key = randomUUID();
    const filePath = this.getFilePath(key);
    const metadataPath = this.getMetadataPath(key);

    await writeFile(filePath, buffer, { flag: 'wx', mode: 0o600 });

    try {
      await writeFile(
        metadataPath,
        JSON.stringify({ mimeType } satisfies StoredMetadata),
        { flag: 'wx', mode: 0o600 },
      );
    } catch (error) {
      try {
        await unlink(filePath);
      } catch (cleanupError) {
        if (!isErrnoError(cleanupError, 'ENOENT')) {
          throw new AggregateError(
            [error, cleanupError],
            'Failed to save storage metadata and clean up the stored file.',
            { cause: cleanupError },
          );
        }
      }

      throw error;
    }

    return key;
  }

  async read(key: string): Promise<StorageReadResult> {
    const filePath = this.getFilePath(key);
    const metadataPath = this.getMetadataPath(key);

    try {
      await this.assertPathWithinStorage(filePath);
    } catch (error) {
      if (isErrnoError(error, 'ENOENT')) {
        throw new NotFoundException('Stored file not found.');
      }
      throw error;
    }

    let buffer: Buffer;
    try {
      buffer = await readFile(filePath);
    } catch (error) {
      if (isErrnoError(error, 'ENOENT')) {
        throw new NotFoundException('Stored file not found.');
      }
      throw error;
    }

    let metadataContent: string;
    try {
      await this.assertPathWithinStorage(metadataPath);
      metadataContent = await readFile(metadataPath, 'utf8');
    } catch (error) {
      if (isErrnoError(error, 'ENOENT')) {
        throw new InternalServerErrorException(
          'Stored file metadata is missing.',
        );
      }
      throw error;
    }

    let metadata: unknown;
    try {
      metadata = JSON.parse(metadataContent);
    } catch {
      throw new InternalServerErrorException(
        'Stored file metadata is invalid.',
      );
    }

    if (
      typeof metadata !== 'object' ||
      metadata === null ||
      !('mimeType' in metadata) ||
      typeof metadata.mimeType !== 'string'
    ) {
      throw new InternalServerErrorException(
        'Stored file metadata is invalid.',
      );
    }

    return {
      buffer,
      mimeType: metadata.mimeType,
      size: buffer.byteLength,
    };
  }

  async delete(key: string): Promise<void> {
    const filePath = this.getFilePath(key);
    const metadataPath = this.getMetadataPath(key);

    try {
      await unlink(filePath);
    } catch (error) {
      if (isErrnoError(error, 'ENOENT')) {
        throw new NotFoundException('Stored file not found.');
      }
      throw error;
    }

    try {
      await unlink(metadataPath);
    } catch (error) {
      if (!isErrnoError(error, 'ENOENT')) {
        throw error;
      }
    }
  }

  private getFilePath(key: string): string {
    this.assertValidKey(key);
    return this.resolvePath(key);
  }

  private getMetadataPath(key: string): string {
    this.assertValidKey(key);
    return this.resolvePath(`${key}.json`);
  }

  private assertValidKey(key: string): void {
    if (!STORAGE_KEY_PATTERN.test(key)) {
      throw new BadRequestException('Invalid storage key.');
    }
  }

  private resolvePath(fileName: string): string {
    const filePath = resolve(this.storagePath, fileName);
    const relativePath = relative(this.storagePath, filePath);

    if (
      relativePath === '' ||
      relativePath === '..' ||
      relativePath.startsWith(`..${sep}`) ||
      isAbsolute(relativePath)
    ) {
      throw new BadRequestException('Invalid storage key.');
    }

    return filePath;
  }

  private async assertPathWithinStorage(filePath: string): Promise<void> {
    const [rootPath, resolvedFilePath] = await Promise.all([
      realpath(this.storagePath),
      realpath(filePath),
    ]);

    const relativePath = relative(rootPath, resolvedFilePath);
    if (
      relativePath === '' ||
      relativePath === '..' ||
      relativePath.startsWith(`..${sep}`) ||
      isAbsolute(relativePath)
    ) {
      throw new InternalServerErrorException(
        'Stored file is outside the storage directory.',
      );
    }
  }
}

function isErrnoError(error: unknown, code: string): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === code
  );
}
