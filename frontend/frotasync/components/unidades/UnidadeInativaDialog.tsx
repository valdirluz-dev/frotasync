"use client";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { Unidade } from "@/types/dashboard";

export function UnidadeInativaDialog({
  unidade,
  open,
  onClose,
  onReturnToUnits,
  resource = "tarefa",
}: {
  unidade: Unidade;
  open: boolean;
  onClose: () => void;
  onReturnToUnits: () => void;
  resource?: "tarefa" | "documento";
}) {
  const article = resource === "documento" ? "o documento" : "a tarefa";
  return (
    <ConfirmDialog
      open={open}
      title={`Não é possível editar ${article}`}
      description={
        <div className="space-y-2">
          <p>
            A unidade &quot;<strong>{unidade.nome} (ID {unidade.codigo})</strong>&quot; está inativa.
          </p>
          <p>Documentos e tarefas de unidades inativas não podem ser modificados.</p>
        </div>
      }
      confirmLabel="Voltar para unidades"
      showCancel={false}
      onCancel={onClose}
      onConfirm={onReturnToUnits}
    />
  );
}
