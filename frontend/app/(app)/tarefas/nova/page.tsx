"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SubmitHandler } from "react-hook-form";

import { AppShell } from "@/components/layout/AppShell";
import { TarefaForm } from "@/components/tarefas/TarefaForm";
import { ErrorState } from "@/components/ui/StateViews";
import { useToast } from "@/components/ui/Toast";
import { useCatalogoUnidades } from "@/hooks/useCatalogos";
import { useCriarTarefa } from "@/hooks/useEdicao";
import type { TarefaFormValues } from "@/schemas/tarefa";

export default function NovaTarefaPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const unidadesQuery = useCatalogoUnidades();
  const createMutation = useCriarTarefa();
  const [unidadeId, setUnidadeId] = useState("");

  const unidadesAtivas =
    unidadesQuery.data?.filter((unidade) => unidade.status === "Ativa") ?? [];
  const unidadeSelecionada = unidadesAtivas.find(
    (unidade) => unidade.id === unidadeId,
  );

  const handleSubmit: SubmitHandler<TarefaFormValues> = async (data) => {
    if (!unidadeId) return;
    try {
      await createMutation.mutateAsync({ ...data, unidadeId });
      showToast("Tarefa criada com sucesso", "success");
      router.push("/tarefas");
    } catch {
      showToast("Não foi possível criar a tarefa. Tente novamente.", "error");
    }
  };

  return (
    <AppShell activeTab="tarefas">
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nova Tarefa</h1>
          <p className="text-xs text-slate-500">
            Preencha as informações abaixo para cadastrar uma nova tarefa.
          </p>
        </div>

        {unidadesQuery.isError ? (
          <div className="rounded-2xl bg-white">
            <ErrorState
              label="Não foi possível carregar as unidades."
              onRetry={() => void unidadesQuery.refetch()}
            />
          </div>
        ) : unidadesQuery.isPending ? (
          <p role="status" className="text-sm text-slate-500">
            Carregando unidades...
          </p>
        ) : (
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Unidade
              </span>
              <select
                value={unidadeId}
                onChange={(event) => setUnidadeId(event.target.value)}
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700">
                <option value="">Selecione uma unidade ativa</option>
                {unidadesAtivas.map((unidade) => (
                  <option key={unidade.id} value={unidade.id}>
                    {unidade.nome} (ID {unidade.codigo})
                  </option>
                ))}
              </select>
            </label>

            {unidadeSelecionada ? (
              <TarefaForm
                mode="criar"
                tarefa={null}
                unidadeId={unidadeId}
                unidadeNome={unidadeSelecionada.nome}
                isSaving={createMutation.isPending}
                onCancel={() => router.back()}
                onSubmit={handleSubmit}
              />
            ) : unidadesAtivas.length === 0 ? (
              <p className="text-sm text-slate-500">
                Cadastre uma unidade ativa antes de criar tarefas.
              </p>
            ) : null}
          </div>
        )}
      </div>
    </AppShell>
  );
}
