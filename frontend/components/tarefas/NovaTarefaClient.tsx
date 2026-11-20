"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { SubmitHandler } from "react-hook-form";

import { AppShell } from "@/components/layout/AppShell";
import { TarefaForm } from "@/components/tarefas/TarefaForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ErrorState, LoadingState } from "@/components/ui/StateViews";
import { useToast } from "@/components/ui/Toast";
import { useCriarTarefa } from "@/hooks/useCriarTarefa";
import { useUnidade } from "@/hooks/useUnidadeDetalhe";
import { useUnidades } from "@/hooks/useUnidades";
import type { TarefaFormValues } from "@/schemas/tarefa";
import type { Tarefa } from "@/types/domain";

export function NovaTarefaClient({ unidadeId }: { unidadeId?: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const creatingLocally = Boolean(unidadeId);
  const unidadeQuery = useUnidade(unidadeId ?? "");
  const unidadesQuery = useUnidades({
    page: 1,
    size: 100,
    status: "Ativa",
  });
  const mutation = useCriarTarefa();
  const [pending, setPending] = useState<TarefaFormValues | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const unidadesAtivas = unidadesQuery.data?.items ?? [];
  const unidade = unidadeQuery.data;
  const unidadeOptions = useMemo(
    () =>
      (unidadesQuery.data?.items ?? []).map(({ id, nome, codigo }) => ({
        id,
        nome,
        codigo,
      })),
    [unidadesQuery.data?.items],
  );
  const selectedUnit = pending
    ? unidadeOptions.find((item) => item.id === pending.unidadeId) ??
      (unidade?.id === pending.unidadeId ? unidade : undefined)
    : undefined;
  const defaultUnitId = creatingLocally
    ? (unidade?.id ?? "")
    : (unidadesAtivas[0]?.id ?? "");
  const backPath = creatingLocally
    ? `/unidades/${unidadeId}?aba=tarefas`
    : "/dashboard?aba=tarefas";

  const submit: SubmitHandler<TarefaFormValues> = (values) => {
    setPending(values);
    setDialogOpen(true);
  };

  async function confirm() {
    if (!pending || mutation.isPending) return;
    try {
      await mutation.mutateAsync(pending);
      setDialogOpen(false);
      showToast("Tarefa criada com sucesso", "success");
      router.push(backPath);
    } catch (error) {
      setDialogOpen(false);
      showToast(
        error instanceof Error
          ? error.message
          : "Não foi possível criar a tarefa. Tente novamente.",
        "error",
      );
    }
  }

  if (creatingLocally && unidadeQuery.isPending) {
    return (
      <AppShell activeTab="unidades">
        <LoadingState label="Carregando unidade..." />
      </AppShell>
    );
  }

  if (creatingLocally && (unidadeQuery.isError || !unidade)) {
    return (
      <AppShell activeTab="unidades">
        <ErrorState
          label="Não foi possível carregar a unidade."
          onRetry={() => void unidadeQuery.refetch()}
        />
      </AppShell>
    );
  }

  if (creatingLocally && unidade?.status === "Inativa") {
    return (
      <AppShell activeTab="unidades">
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          Não é possível cadastrar tarefas em uma unidade inativa.
          <button
            type="button"
            onClick={() => router.push(backPath)}
            className="ml-2 font-semibold underline">
            Voltar para a unidade
          </button>
        </div>
      </AppShell>
    );
  }

  if (!creatingLocally && unidadesQuery.isPending) {
    return (
      <AppShell activeTab="tarefas">
        <LoadingState label="Carregando unidades ativas..." />
      </AppShell>
    );
  }

  if (!creatingLocally && unidadesQuery.isError) {
    return (
      <AppShell activeTab="tarefas">
        <ErrorState
          label="Não foi possível carregar as unidades ativas."
          onRetry={() => void unidadesQuery.refetch()}
        />
      </AppShell>
    );
  }

  if (!creatingLocally && unidadesAtivas.length === 0) {
    return (
      <AppShell activeTab="tarefas">
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          Cadastre ou ative uma unidade antes de criar tarefas.
        </div>
      </AppShell>
    );
  }

  const tarefaVazia: Tarefa = {
    id: "",
    titulo: "",
    unidadeId: defaultUnitId,
    dataInicio: "",
    prazoFinal: "",
    status: "Pendente",
    dataConclusao: null,
  };

  return (
    <AppShell activeTab={creatingLocally ? "unidades" : "tarefas"}>
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nova tarefa</h1>
          <p className="text-xs text-slate-500">
            Preencha as informações abaixo para cadastrar uma nova tarefa.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <TarefaForm
            tarefa={tarefaVazia}
            unidadeNome={unidade?.nome ?? ""}
            unidades={creatingLocally ? undefined : unidadeOptions}
            unidadeBloqueada={creatingLocally}
            mode="criar"
            defaultValues={{
              titulo: "",
              unidadeId: defaultUnitId,
              prazoFinal: "",
              descricao: "",
            }}
            isSaving={mutation.isPending}
            onSubmit={submit}
            onCancel={() => router.push(backPath)}
          />
        </div>
      </div>

      <ConfirmDialog
        open={dialogOpen}
        title="Deseja criar a tarefa?"
        description={
          <p>
            A tarefa <strong>{pending?.titulo}</strong> será criada na unidade{" "}
            <strong>{selectedUnit?.nome ?? unidade?.nome}</strong>. Deseja
            prosseguir?
          </p>
        }
        cancelLabel="Cancelar"
        confirmLabel="Criar tarefa"
        isLoading={mutation.isPending}
        onCancel={() => {
          if (!mutation.isPending) setDialogOpen(false);
        }}
        onConfirm={confirm}
      />
    </AppShell>
  );
}
