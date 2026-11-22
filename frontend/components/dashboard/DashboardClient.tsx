"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ErrorState } from "@/components/ui/StateViews";
import { StatusDonutCard } from "@/components/dashboard/StatusDonutCard";
import { useDashboardIndicators } from "@/hooks/useDashboard";
import { ProcessFlow } from "./ProcessFlow";
import { LicenceStatus } from "./LicenceStatus";

export function DashboardClient() {
  const indicatorQuery = useDashboardIndicators();
  const indicators = indicatorQuery.data;

  return (
    <AppShell activeTab="dashboard">
     

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

        {/*Gráfico Fluxo de Progesso semanal */}
      </section>
      <section  aria-label="Fluxo de Progresso Semanal" className="mt-6">
        <ProcessFlow/>
      </section>

       {/*Status de linceças*/}
      <section  aria-label="Status de licenças" className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LicenceStatus/>
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