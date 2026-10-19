import { z } from "zod";

export const tarefaSchema = z.object({
  titulo: z.string().trim().min(2, "Informe o título da tarefa.").max(150, "O título deve ter até 150 caracteres."),
  prazoFinal: z.string().min(1, "Informe o prazo final."),
  descricao: z.string().trim().max(500, "A descrição deve ter até 500 caracteres.").optional(),
});

export type TarefaFormInput = z.input<typeof tarefaSchema>;
export type TarefaFormValues = z.output<typeof tarefaSchema>;

export function prazoAlteradoValido(prazoFinal: string, prazoOriginal?: string, hoje = new Date()) {
  if (prazoOriginal && prazoFinal === prazoOriginal) return true;
  const today = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate()));
  const selected = new Date(`${prazoFinal}T00:00:00.000Z`);
  return !Number.isNaN(selected.getTime()) && selected >= today;
}
