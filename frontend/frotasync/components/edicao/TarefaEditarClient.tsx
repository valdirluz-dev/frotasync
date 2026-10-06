"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";

import { EditError } from "@/components/edicao/EditError";
import { EditLoading, EditPageShell } from "@/components/edicao/EditPageShell";
import { TarefaForm } from "@/components/tarefas/TarefaForm";
import { UnidadeInativaDialog } from "@/components/unidades/UnidadeInativaDialog";
import { ConfirmDialog, useToast } from "@/components/ui";
import { useEditarTarefa, useTarefa } from "@/hooks/useEdicao";
import { useUnidade } from "@/hooks/useUnidadeDetalhe";
import type { TarefaFormValues } from "@/schemas/tarefa";

export function TarefaEditarClient({ id, unidadeId, porUnidade = false }: { id: string; unidadeId: string; porUnidade?: boolean }) {
  const router = useRouter();
  const { showToast } = useToast();
  const taskQuery = useTarefa(id);
  const unitQuery = useUnidade(unidadeId);
  const mutation = useEditarTarefa();
  const [pending, setPending] = useState<TarefaFormValues | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const tarefa = taskQuery.data;
  const unidade = unitQuery.data;
  const inactive = unidade?.status === "Inativa";
  const base = porUnidade ? `/unidades/${unidadeId}?aba=tarefas` : `/dashboard?aba=tarefas`;
  const back = () => router.push(base);

  const submit: SubmitHandler<TarefaFormValues> = (values) => { setPending(values); setDialogOpen(true); };
  async function confirm() {
    if (!pending || mutation.isPending) return;
    try {
      const updated = await mutation.mutateAsync({ id, data: pending });
      setDialogOpen(false);
      showToast("Tarefa atualizada com sucesso", "success");
      router.push(`${base}&q=${encodeURIComponent(updated.titulo)}`);
    } catch (error) {
      setDialogOpen(false);
      showToast(error instanceof Error && error.message.includes("inativa") ? "Não é possível modificar registros de uma unidade inativa." : "Não foi possível atualizar a tarefa. Tente novamente.", "error");
    }
  }

  if (taskQuery.isPending || unitQuery.isPending) return <EditPageShell activeTab="tarefas" breadcrumb={<span>Dashboard Global / Tarefas / Editar Tarefa</span>} title="Editar Tarefa" backLabel="Voltar para tarefas" onBack={back}><EditLoading /></EditPageShell>;
  if (taskQuery.isError || unitQuery.isError || !tarefa || !unidade || tarefa.unidadeId !== unidadeId) return <EditPageShell activeTab="tarefas" breadcrumb={<span>Dashboard Global / Tarefas / Editar Tarefa</span>} title="Editar Tarefa" backLabel="Voltar para tarefas" onBack={back}><EditError onRetry={() => { void taskQuery.refetch(); void unitQuery.refetch(); }} /></EditPageShell>;
  if (inactive) return <EditPageShell activeTab={porUnidade ? "unidades" : "tarefas"} breadcrumb={<span>{porUnidade ? `Unidades / ${unidade.nome} (ID ${unidade.codigo}) / Tarefas / Editar Tarefa` : "Dashboard Global / Tarefas / Editar Tarefa"}</span>} title="Editar Tarefa" backLabel="Voltar para tarefas" onBack={back}><div className="h-20" /><UnidadeInativaDialog unidade={unidade} open resource="tarefa" onClose={back} onReturnToUnits={() => router.push("/unidades")} /></EditPageShell>;

  return (
    <EditPageShell
      activeTab={porUnidade ? "unidades" : "tarefas"}
      breadcrumb={<><span className="text-slate-500">{porUnidade ? "Unidades" : "Dashboard Global"}</span><span className="text-slate-300">/</span>{porUnidade ? <><span className="max-w-[220px] truncate text-slate-500">{unidade.nome} (ID {unidade.codigo})</span><span className="text-slate-300">/</span></> : null}<span className="text-slate-500">Tarefas</span><span className="text-slate-300">/</span><span className="font-semibold text-slate-800">Editar Tarefa</span></>}
      title="Editar Tarefa"
      backLabel="Voltar para tarefas"
      onBack={back}
    >
      <TarefaForm tarefa={tarefa} unidadeNome={unidade.nome} mode="editar" isSaving={mutation.isPending} onNoChanges={() => showToast("Nenhuma alteração para salvar", "info")} onCancel={back} onSubmit={submit} />
      <ConfirmDialog open={dialogOpen} title="Deseja salvar as alterações?" description={<p>Você está alterando a tarefa &quot;<strong>{tarefa.titulo}</strong>&quot;, na unidade &quot;<strong>{unidade.nome} (ID {unidade.codigo})</strong>&quot;, deseja prosseguir com as alterações?</p>} cancelLabel="Cancelar" confirmLabel="Salvar alterações" isLoading={mutation.isPending} onCancel={() => { if (!mutation.isPending) setDialogOpen(false); }} onConfirm={confirm} />
    </EditPageShell>
  );
}
