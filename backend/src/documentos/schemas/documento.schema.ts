import { z } from 'zod';

export const DocumentoBaseSchema = z.strictObject({
  nome: z
    .string()
    .trim()
    .min(2, 'Nome deve ter ao menos 2 caracteres')
    .max(150),
  tipo: z.string().trim().max(60).optional(),
  categoria: z.string().trim().min(1, 'Categoria é obrigatória').max(40),
  dataEmissao: z
    .union([z.literal('').transform(() => undefined), z.iso.date()])
    .optional(),
  dataValidade: z.iso.date(),
  descricao: z.string().trim().max(500).optional(),
});

export const dataEmissaoAntesDaValidade = (documento: {
  dataEmissao?: string;
  dataValidade?: string;
}): boolean =>
  !documento.dataEmissao ||
  !documento.dataValidade ||
  documento.dataEmissao <= documento.dataValidade;

export type DocumentoBaseDto = z.infer<typeof DocumentoBaseSchema>;
