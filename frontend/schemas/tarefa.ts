import { z } from "zod";

export const tarefaSchema = z.object({
  titulo: z.string().trim().min(2, "Informe o título da tarefa.").max(150, "O título deve ter até 150 caracteres."),
  prazoFinal: z.string().min(1, "Informe o prazo final."),
  descricao: z.string().trim().max(500, "A descrição deve ter até 500 caracteres.").optional(),
});

export type TarefaFormInput = z.input<typeof tarefaSchema>;
export type TarefaFormValues = z.output<typeof tarefaSchema>;

<<<<<<< HEAD
export function prazoAlteradoValido(prazoFinal: string, prazoOriginal?: string, hoje = new Date()) {
  if (prazoOriginal && prazoFinal === prazoOriginal) return true;
  const today = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate()));
  const selected = new Date(`${prazoFinal}T00:00:00.000Z`);
  return !Number.isNaN(selected.getTime()) && selected >= today;
=======
export function tarefaEdicaoSchema(
  prazoOriginal: string,
  hoje = new Date(),
) {
  const today = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate()));
  return tarefaSchema.superRefine(({ prazoFinal }, ctx) => {
    if (prazoFinal === prazoOriginal) return;

    const selected = new Date(`${prazoFinal}T00:00:00.000Z`);
    if (Number.isNaN(selected.getTime()) || selected < today) {
      ctx.addIssue({
        code: "custom",
        path: ["prazoFinal"],
        message: "O prazo não pode ser anterior a hoje quando alterado.",
      });
    }
  });
>>>>>>> f13a41d9f08de0ef78f282cfb715fd7112a3d412
}
