import { z } from 'zod';

export const ListarUnidadesSchema = z.strictObject({
  busca: z.string().trim().optional(),
  status: z.enum(['ativa', 'inativa']).optional(),
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(10),
});

export type ListarUnidadesDto = z.infer<typeof ListarUnidadesSchema>;
