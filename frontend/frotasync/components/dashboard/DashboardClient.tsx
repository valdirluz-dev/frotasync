"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";

import { AppShell } from "@/components/dashboard/AppShell";
import { Icon } from "@/components/dashboard/Icons";
import { StatTrend } from "@/components/dashboard/StatTrend";
import { ErrorState } from "@/components/dashboard/StateViews";
import { StatusDonutCard } from "@/components/dashboard/StatusDonutCard";
import { TabPill } from "@/components/dashboard/TabPill";
import { DocumentosTable } from "@/components/documentos/DocumentosTable";
import { TarefasTable } from "@/components/tarefas/TarefasTable";
import {
  useDashboardDocuments,
  useDashboardIndicators,
  useDashboardTasks,
} from "@/hooks/useDashboard";
import { mockCategorias, mockUnidades } from "@/mocks/dashboard";
import type { DocumentoStatus, TarefaStatus } from "@/types/dashboard";

const documentStatuses: Array<DocumentoStatus | "Todos"> = [
  "Todos",
  "Válido",
  "Próximo do vencimento",
  "Expirado",
];
const taskStatuses: Array<TarefaStatus | "Todos"> = [
  "Todos",
  "Pendente",
  "Em andamento",
  "Concluída",
];
export function DashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab =
    searchParams.get("aba") === "tarefas" ? "tarefas" : "documentos";
  const [unitId, setUnitId] = useState("todas");
  const [documentSearch, setDocumentSearch] = useState("");
  const [taskSearch, setTaskSearch] = useState("");
  const [documentStatus, setDocumentStatus] = useState<
    DocumentoStatus | "Todos"
  >("Todos");
  const [taskStatus, setTaskStatus] = useState<TarefaStatus | "Todos">("Todos");
  const [category, setCategory] = useState("todas");
  const [documentPage, setDocumentPage] = useState(1);
  const [taskPage, setTaskPage] = useState(1);

  const indicatorQuery = useDashboardIndicators();
  const documentQuery = useDashboardDocuments({
    page: documentPage,
    pageSize: 10,
    search: documentSearch,
    unidadeId: unitId,
    categoria: category,
    status: documentStatus,
  });
  const taskQuery = useDashboardTasks({
    page: taskPage,
    pageSize: 10,
    search: taskSearch,
    unidadeId: unitId,
    status: taskStatus,
  });

  const unitNames = useMemo(
    () => new Map(mockUnidades.map((unit) => [unit.id, unit.nome])),
    [],
  );
  const unitStatuses = useMemo(
    () => new Map(mockUnidades.map((unit) => [unit.id, unit.status])),
    [],
  );
  const indicators = indicatorQuery.data;

  function switchTab(nextTab: "documentos" | "tarefas") {
    router.replace(`/dashboard?aba=${nextTab}`, { scroll: false });
  }

  return (
    <AppShell activeTab={activeTab}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 lg:mb-7">
        <h1 className="text-[38px] font-bold leading-tight tracking-[-0.04em] text-slate-900 sm:text-[48px] lg:text-[56px]">
          Dashboard Global
        </h1>
        <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">
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
            />
            <StatusDonutCard
              title="Documentos"
              data={indicators?.documentos ?? []}
              muted={activeTab === "tarefas"}
            />
            <StatusDonutCard
              title="Tarefas"
              data={indicators?.tarefas ?? []}
              muted={activeTab === "documentos"}
            />
          </>
        )}
      </section>

      <section aria-label="Lista global" className="mt-8">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center">
          <TabPill activeTab={activeTab} onChange={switchTab} />

          <div className="min-w-0 flex-1 xl:pl-1">
            {activeTab === "documentos" ? (
              <StatTrend
                label="Total de documentos a vencer"
                value={indicators?.documentosAVencer}
                variation={indicators?.variacaoDocumentosAVencer}
                inverse
              />
            ) : (
              <StatTrend
                label="Total de Tarefas Concluídas"
                value={indicators?.tarefasConcluidas}
                variation={indicators?.variacaoTarefasConcluidas}
              />
            )}
          </div>

          <button
            type="button"
            disabled
            title="Em breve"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-semibold text-white opacity-90 shadow-sm disabled:cursor-not-allowed">
            <Icon name="plus" className="h-4 w-4" />
            {activeTab === "documentos" ? "Novo documento" : "Nova Tarefa"}
          </button>
        </div>

        {activeTab === "documentos" ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <FilterField label="Buscar documento">
                <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
                  <Icon
                    name="search"
                    className="h-4 w-4 shrink-0 text-slate-400"
                  />
                  <input
                    value={documentSearch}
                    onChange={(event) => {
                      setDocumentSearch(event.target.value);
                      setDocumentPage(1);
                    }}
                    placeholder="Digite o nome do documento..."
                    className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400"
                  />
                </div>
              </FilterField>
              <FilterField label="Unidade">
                <select
                  value={unitId}
                  onChange={(event) => {
                    setUnitId(event.target.value);
                    setDocumentPage(1);
                    setTaskPage(1);
                  }}
                  className={selectClass}>
                  <option value="todas">Todas as unidades</option>
                  {mockUnidades.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.nome}
                    </option>
                  ))}
                </select>
              </FilterField>
              <FilterField label="Categoria">
                <select
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value);
                    setDocumentPage(1);
                  }}
                  className={selectClass}>
                  <option value="todas">Todas as categorias</option>
                  {mockCategorias.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </FilterField>
              <FilterField label="Status">
                <select
                  value={documentStatus}
                  onChange={(event) => {
                    setDocumentStatus(
                      event.target.value as DocumentoStatus | "Todos",
                    );
                    setDocumentPage(1);
                  }}
                  className={selectClass}>
                  <option value="Todos">Todos os status</option>
                  {documentStatuses
                    .filter((status) => status !== "Todos")
                    .map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                </select>
              </FilterField>
            </div>

            <div className="mt-7">
              <DocumentosTable
                items={documentQuery.data?.items ?? []}
                mode="global"
                unidadeNames={unitNames}
                unidadeStatuses={unitStatuses}
                isLoading={documentQuery.isPending}
                isError={documentQuery.isError}
                onRetry={() => void documentQuery.refetch()}
                page={documentQuery.data?.page ?? documentPage}
                totalPages={documentQuery.data?.totalPages ?? 1}
                total={documentQuery.data?.total ?? 0}
                pageSize={documentQuery.data?.pageSize ?? 10}
                onPageChange={setDocumentPage}
              />
            </div>
          </>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <FilterField label="Buscar Tarefas">
                <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
                  <Icon
                    name="search"
                    className="h-4 w-4 shrink-0 text-slate-400"
                  />
                  <input
                    value={taskSearch}
                    onChange={(event) => {
                      setTaskSearch(event.target.value);
                      setTaskPage(1);
                    }}
                    placeholder="Digite o nome da tarefa..."
                    className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400"
                  />
                </div>
              </FilterField>
              <FilterField label="Unidade">
                <select
                  value={unitId}
                  onChange={(event) => {
                    setUnitId(event.target.value);
                    setTaskPage(1);
                    setDocumentPage(1);
                  }}
                  className={selectClass}>
                  <option value="todas">Todas as unidades</option>
                  {mockUnidades.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.nome}
                    </option>
                  ))}
                </select>
              </FilterField>
              <FilterField label="Status">
                <select
                  value={taskStatus}
                  onChange={(event) => {
                    setTaskStatus(event.target.value as TarefaStatus | "Todos");
                    setTaskPage(1);
                  }}
                  className={selectClass}>
                  <option value="Todos">Todos os status</option>
                  {taskStatuses
                    .filter((status) => status !== "Todos")
                    .map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                </select>
              </FilterField>
            </div>

            <div className="mt-7">
              <TarefasTable
                items={taskQuery.data?.items ?? []}
                mode="global"
                unidadeNames={unitNames}
                unidadeStatuses={unitStatuses}
                isLoading={taskQuery.isPending}
                isError={taskQuery.isError}
                onRetry={() => void taskQuery.refetch()}
                page={taskQuery.data?.page ?? taskPage}
                totalPages={taskQuery.data?.totalPages ?? 1}
                total={taskQuery.data?.total ?? 0}
                pageSize={taskQuery.data?.pageSize ?? 10}
                onPageChange={setTaskPage}
              />
            </div>
          </>
        )}
      </section>
    </AppShell>
  );
}

const selectClass =
  "h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

function FilterField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[10px] font-bold text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function CardLoading({ label }: { label: string }) {
  return (
    <div className="flex min-h-[390px] items-center justify-center rounded-[30px] bg-indigo-100 text-sm text-indigo-400 sm:min-h-[430px] lg:min-h-[510px]">
      Carregando {label.toLocaleLowerCase("pt-BR")}...
    </div>
  );
}
