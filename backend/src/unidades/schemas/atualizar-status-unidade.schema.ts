import { z } from 'zod';

export const AtualizarStatusUnidadeSchema = z.strictObject({
  status: z.enum(['ativa', 'inativa']),
});

export type AtualizarStatusUnidadeDto = z.infer<
  typeof AtualizarStatusUnidadeSchema
>;
