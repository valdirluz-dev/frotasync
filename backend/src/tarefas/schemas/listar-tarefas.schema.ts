import { z } from 'zod';

const FiltrosBaseSchema = z.strictObject({
  q: z.string().trim().max(150).transform((v) => v || undefined).optional(),
  status: z.enum(['pendente', 'em_andamento', 'concluida']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const ListarTarefasSchema = FiltrosBaseSchema.extend({
  unidadeId: z.uuid().optional(),
});

export const ListarTarefasPorUnidadeSchema = FiltrosBaseSchema;

export type ListarTarefasDto = z.infer<typeof ListarTarefasSchema>;
export type ListarTarefasPorUnidadeDto = z.infer<
  typeof ListarTarefasPorUnidadeSchema
>;
