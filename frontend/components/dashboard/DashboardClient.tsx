"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState } from "@/components/ui/StateViews";
import { StatusDonutCard } from "@/components/dashboard/StatusDonutCard";
import { useDashboardIndicators } from "@/hooks/useDashboard";

export function DashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const indicatorQuery = useDashboardIndicators();
  const indicators = indicatorQuery.data;

  return (
    <AppShell activeTab="dashboard">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 lg:mb-7">
        <h1 className="text-[38px] font-bold leading-tight tracking-[-0.04em] text-slate-900 sm:text-[48px] lg:text-[56px]">
          Dashboard Global
        </h1>
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Pendências totais{" "}
          <span className="tabular-nums">
            {indicators?.totalPendencias ?? "—"}
          </span>
        </div>
      </div>

      <section
        aria-label="Indicadores gerais"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-5 2xl:gap-6">
        {indicatorQuery.isPending ? (
          <>
            <CardLoading label="Unidades" />
            <CardLoading label="Documentos" />
            <CardLoading label="Tarefas" />
          </>
        ) : indicatorQuery.isError ? (
          <div className="col-span-full rounded-2xl bg-white p-4">
            <ErrorState
              label="Não foi possível carregar os indicadores."
              onRetry={() => void indicatorQuery.refetch()}
            />
          </div>
        ) : (
          <>
            <StatusDonutCard
              title="Unidades"
              data={indicators?.unidades ?? []}
              href="/unidades"
            />
            <StatusDonutCard
              title="Documentos"
              data={indicators?.documentos ?? []}
              href="/documentos"
            />
            <StatusDonutCard
              title="Tarefas"
              data={indicators?.tarefas ?? []}
              href="/tarefas"
            />
          </>
        )}
      </section>
    </AppShell>
  );
}

function CardLoading({ label }: { label: string }) {
  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-[24px] bg-indigo-100 text-sm text-indigo-400">
      Carregando {label.toLocaleLowerCase("pt-BR")}...
    </div>
  );
}