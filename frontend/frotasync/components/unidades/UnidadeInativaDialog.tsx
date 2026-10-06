"use client";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Unidade } from "@/types/dashboard";

export function UnidadeInativaDialog({
  unidade,
  open,
  onClose,
  onReturnToUnits,
}: {
  unidade: Unidade;
  open: boolean;
  onClose: () => void;
  onReturnToUnits: () => void;
}) {
  return (
    <ConfirmDialog
      open={open}
      title="Não é possível cadastrar a tarefa"
      description={
        <div className="space-y-2">
          <p>
            A unidade &quot;
            <strong>
              {unidade.nome} (ID {unidade.codigo})
            </strong>
            &quot; está inativa.
          </p>
          <p>Novas tarefas não podem ser cadastradas em unidades inativas.</p>
        </div>
      }
      confirmLabel="Voltar para unidades"
      showCancel={false}
      onCancel={onClose}
      onConfirm={onReturnToUnits}
    />
  );
}
