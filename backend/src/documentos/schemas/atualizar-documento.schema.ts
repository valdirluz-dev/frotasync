import { z } from 'zod';
import {
  dataEmissaoAntesDaValidade,
  DocumentoBaseSchema,
} from './documento.schema';

export const AtualizarDocumentoSchema = DocumentoBaseSchema.partial().refine(
  dataEmissaoAntesDaValidade,
  {
    message: 'A data de emissão não pode ser posterior à data de validade',
    path: ['dataEmissao'],
  },
);

export type AtualizarDocumentoDto = z.infer<typeof AtualizarDocumentoSchema>;
