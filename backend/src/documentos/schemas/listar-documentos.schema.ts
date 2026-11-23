import { z } from 'zod';

export const ListarDocumentosSchema = z.strictObject({
  q: z
    .string()
    .trim()
    .max(150)
    .transform((value) => (value.length > 0 ? value : undefined))
    .optional(),
  categoria: z.string().trim().max(40).optional(),
  unidadeId: z.string().uuid().optional(),
  validade: z.enum(['valido', 'proximo_vencimento', 'expirado']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListarDocumentosDto = z.infer<typeof ListarDocumentosSchema>;
