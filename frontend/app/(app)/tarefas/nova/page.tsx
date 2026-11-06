"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { TarefaForm } from "@/components/tarefas/TarefaForm";
import { atualizarTarefa } from "@/services/tarefasService";
import { useToast } from "@/components/ui";
import type { SubmitHandler } from "react-hook-form";
import type { TarefaFormValues } from "@/schemas/tarefa";

/**
 * Rota: /tarefas/novo
 * 
 * Página responsável por renderizar o formulário para o registo
 * e criação de uma nova tarefa no sistema.
 */
export default function NovaTarefaPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: TarefaFormValues) => atualizarTarefa("novo", data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard", "tasks"] });
    },
  });

  const base = "/dashboard?aba=tarefas";
  const back = () => router.push(base);

  const handleSubmit: SubmitHandler<TarefaFormValues> = async (values) => {
    if (mutation.isPending) return;
    try {
      await mutation.mutateAsync(values);
      showToast("Tarefa criada com sucesso", "success");
      router.push(base);
    } catch (error) {
      showToast("Não foi possível criar a tarefa. Tente novamente.", "error");
    }
  };

  return (
    <AppShell activeTab="tarefas">
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
        
        {/* Cabeçalho da página */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nova Tarefa</h1>
          <p className="text-xs text-slate-500">
            Preencha as informações abaixo para cadastrar uma nova tarefa.
          </p>
        </div>

        {/* Bloco do formulário de criação */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <TarefaForm
            mode="criar"
            tarefa={null}
            unidadeNome=""
            isSaving={mutation.isPending}
            onCancel={back}
            onSubmit={handleSubmit}
          />
        </div>

      </div>
    </AppShell>
  );
}