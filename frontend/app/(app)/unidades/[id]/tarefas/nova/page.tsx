import { NovaTarefaClient } from "@/components/tarefas/NovaTarefaClient";

export default async function NovaTarefaPorUnidadePage({
  params,
}: PageProps<"/unidades/[id]/tarefas/nova">) {
  const { id } = await params;
  return <NovaTarefaClient unidadeId={id} />;
}
