import { TarefaEditarClient } from "@/components/edicao/TarefaEditarClient";

export default async function Page({ params }: PageProps<"/tarefas/[id]/editar">) {
  const { id } = await params;
  return <TarefaEditarClient id={id} unidadeId="" />;
}
