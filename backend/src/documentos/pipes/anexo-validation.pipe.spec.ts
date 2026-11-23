import {
  BadRequestException,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { describe, expect, it } from '@jest/globals';
import {
  ANEXO_FIELD_NAME,
  ANEXO_UPLOAD_OPTIONS,
  MAX_ANEXO_SIZE_BYTES,
} from '../interceptors/anexo-upload.interceptor';
import { AnexoUploadFile, AnexoValidationPipe } from './anexo-validation.pipe';

const metadata = {} as Parameters<AnexoValidationPipe['transform']>[1];

function criarArquivo(
  buffer: Buffer,
  mimetype: string,
  size = buffer.byteLength,
): AnexoUploadFile {
  return { originalname: 'anexo.pdf', buffer, mimetype, size };
}

describe('AnexoValidationPipe', () => {
  const pipe = new AnexoValidationPipe();

  it('configura Multer para receber o campo anexo com limite de 10 MB', () => {
    expect(ANEXO_FIELD_NAME).toBe('anexo');
    expect(ANEXO_UPLOAD_OPTIONS.limits.fileSize).toBe(10_485_760);
    expect(MAX_ANEXO_SIZE_BYTES).toBe(10_485_760);
  });

  it('aceita um PDF com assinatura válida', () => {
    const arquivo = criarArquivo(
      Buffer.from('%PDF-1.7\nconteúdo'),
      'application/pdf',
    );

    expect(pipe.transform(arquivo, metadata)).toBe(arquivo);
  });

  it('aceita um JPEG com assinatura válida', () => {
    const arquivo = criarArquivo(
      Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00]),
      'image/jpeg',
    );

    expect(pipe.transform(arquivo, metadata)).toBe(arquivo);
  });

  it('aceita um PNG com assinatura válida', () => {
    const arquivo = criarArquivo(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      'image/png',
    );

    expect(pipe.transform(arquivo, metadata)).toBe(arquivo);
  });

  it('rejeita MIME declarado incompatível com a assinatura', () => {
    const arquivo = criarArquivo(
      Buffer.from('%PDF-1.7\nconteúdo'),
      'image/png',
    );

    expect(() => pipe.transform(arquivo, metadata)).toThrow(
      UnsupportedMediaTypeException,
    );
  });

  it('rejeita MIME não permitido', () => {
    const arquivo = criarArquivo(Buffer.from('conteúdo'), 'text/plain');

    expect(() => pipe.transform(arquivo, metadata)).toThrow(
      UnsupportedMediaTypeException,
    );
  });

  it('rejeita conteúdo sem assinatura suportada', () => {
    const arquivo = criarArquivo(
      Buffer.from('não é um PDF, JPEG ou PNG'),
      'application/pdf',
    );

    expect(() => pipe.transform(arquivo, metadata)).toThrow(
      UnsupportedMediaTypeException,
    );
  });

  it('retorna 400 quando o anexo obrigatório está ausente', () => {
    expect(() => pipe.transform(undefined, metadata)).toThrow(
      BadRequestException,
    );
  });

  it('aceita ausência de arquivo quando ele é opcional', () => {
    expect(new AnexoValidationPipe(false).transform(undefined, metadata)).toBe(
      undefined,
    );
  });

  it('aceita um arquivo com exatamente 10 MB', () => {
    const buffer = Buffer.alloc(MAX_ANEXO_SIZE_BYTES);
    buffer.write('%PDF-1.7\n');
    const arquivo = criarArquivo(buffer, 'application/pdf');

    expect(pipe.transform(arquivo, metadata)).toBe(arquivo);
  });

  it('retorna 413 quando o arquivo ultrapassa 10 MB', () => {
    const buffer = Buffer.alloc(MAX_ANEXO_SIZE_BYTES + 1);
    buffer.write('%PDF-1.7\n');
    const arquivo = criarArquivo(buffer, 'application/pdf');

    expect(() => pipe.transform(arquivo, metadata)).toThrow(
      PayloadTooLargeException,
    );
  });

  it('retorna 413 quando o tamanho informado excede 10 MB', () => {
    const arquivo = criarArquivo(
      Buffer.from('%PDF-1.7\n'),
      'application/pdf',
      MAX_ANEXO_SIZE_BYTES + 1,
    );

    expect(() => pipe.transform(arquivo, metadata)).toThrow(
      PayloadTooLargeException,
    );
  });
});
