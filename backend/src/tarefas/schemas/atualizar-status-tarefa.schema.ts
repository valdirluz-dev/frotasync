import { z } from 'zod';

export const AtualizarStatusTarefaSchema = z
  .strictObject({
    status: z.enum(['pendente', 'em_andamento', 'concluida']),
    confirmacao: z.boolean().optional(),
  })
  .refine(
    (dados) =>
      dados.status !== 'concluida' || dados.confirmacao === true,
    {
      message: 'A confirmação é obrigatória para concluir a tarefa.',
      path: ['confirmacao'],
    },
  );

export type AtualizarStatusTarefaDto = z.infer<
  typeof AtualizarStatusTarefaSchema
>;
