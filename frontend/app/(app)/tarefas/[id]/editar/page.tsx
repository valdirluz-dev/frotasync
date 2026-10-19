import { TarefaEditarClient } from "@/components/edicao/TarefaEditarClient";
import { obterTarefa } from "@/services/tarefasService";

export default async function Page({ params }: PageProps<"/tarefas/[id]/editar">) {
  const { id } = await params;
  const tarefa = await obterTarefa(id);
  return <TarefaEditarClient id={id} unidadeId={tarefa?.unidadeId ?? ""} />;
}
