import { z } from 'zod';

export const ListarUnidadesSchema = z.strictObject({
  q: z
    .string()
    .trim()
    .max(150)
    .transform((value) => (value.length > 0 ? value : undefined))
    .optional(),
  status: z.enum(['ativa', 'inativa']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListarUnidadesDto = z.infer<typeof ListarUnidadesSchema>;
