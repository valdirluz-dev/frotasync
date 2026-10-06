import type { DocumentoStatus, TarefaStatus } from "@/types/dashboard";

type BadgeStatus = DocumentoStatus | TarefaStatus;

const classes: Record<BadgeStatus, string> = {
  Válido: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "Próximo do vencimento": "border-orange-200 bg-orange-50 text-orange-700",
  Expirado: "border-red-200 bg-red-50 text-red-700",
  Pendente: "border-red-200 bg-red-50 text-red-700",
  "Em andamento": "border-amber-200 bg-amber-50 text-amber-700",
  Concluída: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function StatusBadge({ status }: { status: BadgeStatus }) {
  return (
    <span
      className={`inline-flex max-w-[120px] items-center justify-center rounded-md border px-2 py-1 text-center text-[10px] font-medium leading-tight ${classes[status]}`}>
      {status}
    </span>
  );
}
