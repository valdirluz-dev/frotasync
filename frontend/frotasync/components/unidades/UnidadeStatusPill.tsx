import { getUnitStatusPillClasses } from "@/components/dashboard/StatusBadge";
import type { UnidadeStatus } from "@/types/dashboard";

export function UnidadeStatusPill({ status }: { status: UnidadeStatus }) {
  const presentation = getUnitStatusPillClasses(status);

  return (
    <span
      className={`relative flex w-full items-center justify-center rounded-full px-3 py-2 text-xs font-bold tracking-wide ${presentation.pill}`}>
      <span
        aria-hidden="true"
        className={`absolute left-3 h-2.5 w-2.5 rounded-full ${presentation.indicator}`}
      />
      {presentation.label}
    </span>
  );
}
