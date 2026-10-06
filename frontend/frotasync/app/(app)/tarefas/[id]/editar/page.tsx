import { notFound } from "next/navigation";

import { TarefaEditarClient } from "@/components/edicao/TarefaEditarClient";
import { obterTarefa } from "@/services/tarefasService";
import { obterUnidade } from "@/services/dashboardService";

export default async function Page({ params }: PageProps<"/tarefas/[id]/editar">) {
  const { id } = await params;
  const tarefa = await obterTarefa(id);
  if (!tarefa) notFound();
  const unidade = await obterUnidade(tarefa.unidadeId);
  if (!unidade) notFound();
  return <TarefaEditarClient id={tarefa.id} unidadeId={unidade.id} />;
}
