import { z } from 'zod';

export const TarefaBaseSchema = z.strictObject({
  titulo: z
    .string()
    .trim()
    .min(2, 'Título deve ter ao menos 2 caracteres')
    .max(150),
  descricao: z.string().trim().max(500).optional(),
  prazoFinal: z.iso.date(),
});

export type TarefaBaseDto = z.infer<typeof TarefaBaseSchema>;
