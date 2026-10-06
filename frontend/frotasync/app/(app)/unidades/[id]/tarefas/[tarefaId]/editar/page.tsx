import { notFound } from "next/navigation";

import { TarefaEditarClient } from "@/components/edicao/TarefaEditarClient";
import { obterTarefa } from "@/services/tarefasService";
import { obterUnidade } from "@/services/dashboardService";

export default async function Page({ params }: PageProps<"/unidades/[id]/tarefas/[tarefaId]/editar">) {
  const { id, tarefaId } = await params;
  const [tarefa, unidade] = await Promise.all([obterTarefa(tarefaId), obterUnidade(id)]);
  if (!tarefa || !unidade || tarefa.unidadeId !== id) notFound();
  return <TarefaEditarClient id={tarefa.id} unidadeId={unidade.id} porUnidade />;
}
