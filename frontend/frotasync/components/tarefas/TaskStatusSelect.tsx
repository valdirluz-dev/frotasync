"use client";

import { useState } from "react";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Icon } from "@/components/dashboard/Icons";
import {
  getStatusBadgeClasses,
  StatusBadge,
} from "@/components/dashboard/StatusBadge";
import { useAlterarStatusTarefa } from "@/hooks/useUnidadeDetalhe";
import { useToast } from "@/components/ui/Toast";
import { UnidadeInativaError } from "@/services/dashboardService";
import type { Tarefa, TarefaStatus } from "@/types/dashboard";

const taskStatuses: TarefaStatus[] = ["Pendente", "Em andamento", "Concluída"];

export function TaskStatusSelect({
  tarefa,
  disabled = false,
}: {
  tarefa: Tarefa;
  disabled?: boolean;
}) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const mutation = useAlterarStatusTarefa();
  const { showToast } = useToast();

  async function saveStatus(status: TarefaStatus): Promise<boolean> {
    try {
      await mutation.mutateAsync({ tarefaId: tarefa.id, status });
      showToast(
        status === "Concluída"
          ? "Tarefa concluída com sucesso"
          : "Status da tarefa atualizado",
        "success",
      );
      return true;
    } catch (error) {
      showToast(
        error instanceof UnidadeInativaError
          ? "Unidade inativa: não é possível alterar o status desta tarefa."
          : "Não foi possível atualizar o status da tarefa.",
        "error",
      );
      return false;
    }
  }

  function handleChange(status: TarefaStatus) {
    if (status === tarefa.status) return;
    if (status === "Concluída") {
      setIsConfirmOpen(true);
      return;
    }
    void saveStatus(status);
  }

  return (
    <>
      {disabled ? (
        <StatusBadge status={tarefa.status} uppercase />
      ) : (
        <span className="relative inline-flex">
          <select
            aria-label={`Alterar status da tarefa ${tarefa.titulo}`}
            value={tarefa.status}
            onChange={(event) =>
              handleChange(event.target.value as TarefaStatus)
            }
            disabled={mutation.isPending}
            className={`max-w-[145px] appearance-none rounded-md border py-1 pl-2 pr-7 text-center text-[10px] font-bold uppercase leading-tight outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-60 ${getStatusBadgeClasses(tarefa.status)}`}>
            {taskStatuses.map((status) => (
              <option key={status} value={status}>
                {status.toLocaleUpperCase("pt-BR")}
              </option>
            ))}
          </select>
          <Icon
            name="chevron"
            className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2"
          />
        </span>
      )}

      <ConfirmDialog
        open={isConfirmOpen}
        title="Concluir tarefa?"
        description={
          <p>
            Você está marcando &quot;<strong>{tarefa.titulo}</strong>&quot; como
            Concluída.
          </p>
        }
        cancelLabel="Cancelar"
        confirmLabel="Confirmar conclusão"
        isLoading={mutation.isPending}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={async () => {
          if (await saveStatus("Concluída")) setIsConfirmOpen(false);
        }}
      />
    </>
  );
}
