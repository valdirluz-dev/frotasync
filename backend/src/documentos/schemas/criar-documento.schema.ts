import { z } from 'zod';
import {
  dataEmissaoAntesDaValidade,
  DocumentoBaseSchema,
} from './documento.schema';

export const CriarDocumentoSchema = DocumentoBaseSchema.refine(
  dataEmissaoAntesDaValidade,
  {
    message: 'A data de emissão não pode ser posterior à data de validade',
    path: ['dataEmissao'],
  },
);

export type CriarDocumentoDto = z.infer<typeof CriarDocumentoSchema>;
