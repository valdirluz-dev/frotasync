import type {
  DocumentoStatus,
  TarefaStatus,
  UnidadeStatus,
} from "@/types/dashboard";

export type BadgeStatus = DocumentoStatus | TarefaStatus | UnidadeStatus;

const statusPresentation: Record<
  BadgeStatus,
  { badge: string; unitPill: string; indicator: string }
> = {
  Válido: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    unitPill: "",
    indicator: "",
  },
  "Próximo do vencimento": {
    badge: "border-orange-200 bg-orange-50 text-orange-700",
    unitPill: "",
    indicator: "",
  },
  Expirado: {
    badge: "border-red-200 bg-red-50 text-red-700",
    unitPill: "",
    indicator: "",
  },
  Pendente: {
    badge: "border-red-200 bg-red-50 text-red-700",
    unitPill: "",
    indicator: "",
  },
  "Em andamento": {
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    unitPill: "",
    indicator: "",
  },
  Concluída: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    unitPill: "",
    indicator: "",
  },
  Ativa: {
    badge: "border-green-200 bg-green-50 text-green-700",
    unitPill: "bg-[#22A722] text-white",
    indicator: "bg-green-300",
  },
  Inativa: {
    badge: "border-red-200 bg-red-50 text-red-700",
    unitPill: "bg-red-600 text-white",
    indicator: "bg-red-400",
  },
};

export function StatusBadge({ status }: { status: BadgeStatus }) {
  return (
    <span
      className={`inline-flex max-w-[120px] items-center justify-center rounded-md border px-2 py-1 text-center text-[10px] font-medium leading-tight ${statusPresentation[status].badge}`}>
      {status}
    </span>
  );
}

export function getUnitStatusPillClasses(status: UnidadeStatus) {
  return {
    label: status.toLocaleUpperCase("pt-BR"),
    pill: statusPresentation[status].unitPill,
    indicator: statusPresentation[status].indicator,
  };
}
