import { z } from 'zod';
import { TarefaBaseSchema } from './tarefa.schema';

export const AtualizarTarefaSchema = TarefaBaseSchema.partial().refine(
  (dados) => Object.keys(dados).length > 0,
  {
    message: 'Informe ao menos um campo para atualização.',
  },
);

export type AtualizarTarefaDto = z.infer<typeof AtualizarTarefaSchema>;
