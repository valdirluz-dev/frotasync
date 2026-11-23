import {
  ArgumentMetadata,
  BadRequestException,
  PayloadTooLargeException,
  PipeTransform,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { MAX_ANEXO_SIZE_BYTES } from '../interceptors/anexo-upload.interceptor';

export interface AnexoUploadFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
}

type AnexoMimeType = 'application/pdf' | 'image/jpeg' | 'image/png';

const MIME_TYPES_PERMITIDOS = new Set<AnexoMimeType>([
  'application/pdf',
  'image/jpeg',
  'image/png',
]);

export class AnexoValidationPipe implements PipeTransform<
  AnexoUploadFile | undefined
> {
  constructor(private readonly obrigatorio = true) {}

  transform(
    arquivo: AnexoUploadFile | undefined,
    _metadata: ArgumentMetadata,
  ): AnexoUploadFile | undefined {
    if (!arquivo) {
      if (this.obrigatorio) {
        throw new BadRequestException('O arquivo anexo é obrigatório.');
      }

      return undefined;
    }

    if (
      arquivo.size > MAX_ANEXO_SIZE_BYTES ||
      arquivo.buffer?.byteLength > MAX_ANEXO_SIZE_BYTES
    ) {
      throw new PayloadTooLargeException(
        'O arquivo excede o tamanho máximo de 10 MB.',
      );
    }

    if (!MIME_TYPES_PERMITIDOS.has(arquivo.mimetype as AnexoMimeType)) {
      throw new UnsupportedMediaTypeException('Tipo de arquivo não suportado.');
    }

    if (!Buffer.isBuffer(arquivo.buffer)) {
      throw new UnsupportedMediaTypeException(
        'O conteúdo do arquivo não corresponde ao tipo informado.',
      );
    }

    const mimeDetectado = this.detectarMimeType(arquivo.buffer);

    if (mimeDetectado !== arquivo.mimetype) {
      throw new UnsupportedMediaTypeException(
        'O conteúdo do arquivo não corresponde ao tipo informado.',
      );
    }

    return arquivo;
  }

  private detectarMimeType(buffer: Buffer): AnexoMimeType | undefined {
    if (buffer.subarray(0, 5).toString('ascii') === '%PDF-') {
      return 'application/pdf';
    }

    if (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    ) {
      return 'image/jpeg';
    }

    const assinaturaPng = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);

    if (
      buffer.length >= assinaturaPng.length &&
      buffer.subarray(0, assinaturaPng.length).equals(assinaturaPng)
    ) {
      return 'image/png';
    }

    return undefined;
  }
}
