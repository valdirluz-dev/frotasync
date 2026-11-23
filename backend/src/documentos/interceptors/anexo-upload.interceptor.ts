import { FileInterceptor } from '@nestjs/platform-express';

export const ANEXO_FIELD_NAME = 'anexo';
export const MAX_ANEXO_SIZE_BYTES = 10 * 1024 * 1024;

export const ANEXO_UPLOAD_OPTIONS = {
  limits: {
    fileSize: MAX_ANEXO_SIZE_BYTES,
  },
};

export const AnexoUploadInterceptor = FileInterceptor(
  ANEXO_FIELD_NAME,
  ANEXO_UPLOAD_OPTIONS,
);
