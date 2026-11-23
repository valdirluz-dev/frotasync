import { z } from 'zod';
import {
  dataEmissaoAntesDaValidade,
  DocumentoBaseSchema,
} from './documento.schema';

export const AtualizarDocumentoSchema = DocumentoBaseSchema.partial()
  .refine(dataEmissaoAntesDaValidade, {
    message: 'A data de emissão não pode ser posterior à data de validade',
    path: ['dataEmissao'],
  })
  .refine((documento) => Object.keys(documento).length > 0, {
    message: 'Informe ao menos um campo para atualizar',
  });

export type AtualizarDocumentoDto = z.infer<typeof AtualizarDocumentoSchema>;
