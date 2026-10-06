"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { AppShell } from "@/components/dashboard/AppShell";
import { Icon } from "@/components/dashboard/Icons";
import { ErrorState } from "@/components/dashboard/StateViews";
import { StatTrend } from "@/components/dashboard/StatTrend";
import { StatusDonutCard } from "@/components/dashboard/StatusDonutCard";
import { TabPill } from "@/components/dashboard/TabPill";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { DocumentosTable } from "@/components/documentos/DocumentosTable";
import { TarefasTable } from "@/components/tarefas/TarefasTable";
import { UnidadeDetailFilters } from "@/components/unidades/UnidadeDetailFilters";
import { UnidadeHeader } from "@/components/unidades/UnidadeHeader";
import { UnidadeInfoCard } from "@/components/unidades/UnidadeInfoCard";
import { UnidadeInativaDialog } from "@/components/unidades/UnidadeInativaDialog";
import { useDashboardDocuments, useDashboardTasks } from "@/hooks/useDashboard";
import {
  useAlterarStatusUnidade,
  useUnidade,
  useUnidadeIndicadores,
} from "@/hooks/useUnidadeDetalhe";
import { useSessao } from "@/hooks/useSessao";
import type {
  DocumentoStatus,
  TarefaStatus,
  UnidadeStatus,
} from "@/types/dashboard";

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

function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

function parseDocumentStatus(value: string | null): DocumentoStatus | "Todos" {
  return documentStatuses.includes(value as DocumentoStatus | "Todos")
    ? (value as DocumentoStatus | "Todos")
    : "Todos";
}

function parseTaskStatus(value: string | null): TarefaStatus | "Todos" {
  return taskStatuses.includes(value as TarefaStatus | "Todos")
    ? (value as TarefaStatus | "Todos")
    : "Todos";
}

export function UnidadeDetalheClient({ id }: { id: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { usuario } = useSessao();
  const activeTab: "documentos" | "tarefas" =
    searchParams.get("aba") === "tarefas" ? "tarefas" : "documentos";
  const query = searchParams.get("q") ?? "";
  const page = parsePage(searchParams.get("page"));
  const category = searchParams.get("categoria") ?? "todas";
  const documentStatus = parseDocumentStatus(searchParams.get("status"));
  const taskStatus = parseTaskStatus(searchParams.get("status"));

  const unitQuery = useUnidade(id);
  const indicatorsQuery = useUnidadeIndicadores(id);
  const documentQuery = useDashboardDocuments({
    page,
    pageSize: 10,
    search: query,
    unidadeId: id,
    categoria: category,
    status: documentStatus,
  });
  const taskQuery = useDashboardTasks({
    page,
    pageSize: 10,
    search: query,
    unidadeId: id,
    status: taskStatus,
  });
  const changeStatusMutation = useAlterarStatusUnidade();

  const [statusToSet, setStatusToSet] = useState<UnidadeStatus | null>(null);
  const [inativaDialogOpen, setInativaDialogOpen] = useState(false);
  const unidade = unitQuery.data;
  const isAdministrator = usuario.perfil === "Administrador";
  const isInactive = unidade?.status === "Inativa";
  const updateQuery = useCallback(
    (updates: {
      aba?: "documentos" | "tarefas";
      q?: string;
      status?: string;
      categoria?: string;
      page?: number;
    }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (updates.aba !== undefined) params.set("aba", updates.aba);
      if (updates.q !== undefined) {
        if (updates.q) params.set("q", updates.q);
        else params.delete("q");
      }
      if (updates.status !== undefined) {
        if (updates.status === "Todos") params.delete("status");
        else params.set("status", updates.status);
      }
      if (updates.categoria !== undefined) {
        if (updates.categoria === "todas") params.delete("categoria");
        else params.set("categoria", updates.categoria);
      }
      if (updates.page !== undefined && updates.page > 1) {
        params.set("page", String(updates.page));
      } else if (updates.page !== undefined) {
        params.delete("page");
      }
      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  const commitSearch = useCallback(
    (value: string) => updateQuery({ q: value, page: 1 }),
    [updateQuery],
  );

  useEffect(() => {
    const resultPage =
      activeTab === "documentos"
        ? documentQuery.data?.page
        : taskQuery.data?.page;
    const isPlaceholder =
      activeTab === "documentos"
        ? documentQuery.isPlaceholderData
        : taskQuery.isPlaceholderData;
    if (resultPage !== undefined && !isPlaceholder && resultPage !== page) {
      updateQuery({ page: resultPage });
    }
  }, [
    activeTab,
    documentQuery.data?.page,
    documentQuery.isPlaceholderData,
    page,
    taskQuery.data?.page,
    taskQuery.isPlaceholderData,
    updateQuery,
  ]);

  async function confirmUnitStatus() {
    if (!unidade || !statusToSet || !isAdministrator) return;
    try {
      await changeStatusMutation.mutateAsync({ id, status: statusToSet });
      showToast(
        statusToSet === "Ativa"
          ? "Unidade ativada com sucesso"
          : "Unidade desativada com sucesso",
        "success",
      );
      setStatusToSet(null);
    } catch {
      showToast("Não foi possível alterar o status da unidade.", "error");
    }
  }

  const breadcrumb:
    | "section"
    | {
        unitName: string;
        unitCode: string;
        tab: "documentos" | "tarefas";
      } = unidade
    ? {
        unitName: unidade.nome,
        unitCode: unidade.codigo,
        tab: activeTab,
      }
    : "section";

  return (
    <AppShell activeTab="unidades" breadcrumb={breadcrumb}>
      {unitQuery.isPending ? (
        <div className="space-y-6" role="status">
          <div className="h-20 animate-pulse rounded-xl bg-slate-200" />
          <div className="grid gap-5 xl:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="h-[390px] animate-pulse rounded-[30px] bg-indigo-100"
              />
            ))}
          </div>
        </div>
      ) : unitQuery.isError || !unidade ? (
        <div className="rounded-2xl bg-white">
          <ErrorState
            label="Não foi possível carregar os dados da unidade."
            onRetry={() => void unitQuery.refetch()}
          />
        </div>
      ) : (
        <>
          <div className="space-y-6">
            <UnidadeHeader
              unidade={unidade}
              canManageStatus={isAdministrator}
              isPending={changeStatusMutation.isPending}
              onStatusAction={setStatusToSet}
            />

            <section
              aria-label="Resumo da unidade"
              className="grid gap-5 xl:grid-cols-3">
              <UnidadeInfoCard unidade={unidade} />
              {indicatorsQuery.isPending ? (
                <>
                  <div className="min-h-[390px] animate-pulse rounded-[30px] bg-indigo-100" />
                  <div className="min-h-[390px] animate-pulse rounded-[30px] bg-indigo-100" />
                </>
              ) : indicatorsQuery.isError || !indicatorsQuery.data ? (
                <div className="col-span-2 rounded-2xl bg-white">
                  <ErrorState
                    label="Não foi possível carregar os indicadores da unidade."
                    onRetry={() => void indicatorsQuery.refetch()}
                  />
                </div>
              ) : (
                <>
                  <StatusDonutCard
                    title="Documentos"
                    data={indicatorsQuery.data.documentos}
                    muted={isInactive || activeTab !== "documentos"}
                  />
                  <StatusDonutCard
                    title="Tarefas"
                    data={indicatorsQuery.data.tarefas}
                    muted={isInactive || activeTab !== "tarefas"}
                  />
                </>
              )}
            </section>

            <section aria-label="Listas da unidade" className="space-y-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                <TabPill
                  activeTab={activeTab}
                  onChange={(nextTab) => {
                    updateQuery({
                      aba: nextTab,
                      status: "Todos",
                      categoria: "todas",
                      page: 1,
                    });
                  }}
                />
                <div className="min-w-0 flex-1">
                  {activeTab === "documentos" ? (
                    <StatTrend
                      label="Total de documentos expirados"
                      value={indicatorsQuery.data?.documentosExpirados}
                      variation={
                        indicatorsQuery.data?.variacaoDocumentosExpirados
                      }
                      inverse
                    />
                  ) : (
                    <StatTrend
                      label="Total de Tarefas Concluídas"
                      value={indicatorsQuery.data?.tarefasConcluidas}
                      variation={
                        indicatorsQuery.data?.variacaoTarefasConcluidas
                      }
                    />
                  )}
                </div>
                {activeTab === "documentos" ? (
                  <button
                    type="button"
                    disabled
                    title={isInactive ? "Unidade inativa" : "Em breve"}
                    className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold text-white shadow-sm disabled:cursor-not-allowed ${isInactive ? "bg-indigo-300" : "bg-indigo-600"}`}>
                    <Icon name="plus" className="h-4 w-4" />
                    Novo documento
                  </button>
                ) : isInactive ? (
                  <button
                    type="button"
                    aria-disabled="true"
                    onClick={() => setInativaDialogOpen(true)}
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-300 px-4 text-xs font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
                    <Icon name="plus" className="h-4 w-4" />
                    Nova Tarefa
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    title="Em breve"
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-semibold text-white shadow-sm disabled:cursor-not-allowed">
                    <Icon name="plus" className="h-4 w-4" />
                    Nova Tarefa
                  </button>
                )}
              </div>

              <UnidadeDetailFilters
                key={`${activeTab}:${query}`}
                tab={activeTab}
                query={query}
                category={category}
                documentStatus={documentStatus}
                taskStatus={taskStatus}
                onQueryCommit={commitSearch}
                onCategoryChange={(value) =>
                  updateQuery({ categoria: value, page: 1 })
                }
                onDocumentStatusChange={(value) =>
                  updateQuery({ status: value, page: 1 })
                }
                onTaskStatusChange={(value) =>
                  updateQuery({ status: value, page: 1 })
                }
              />

              {activeTab === "documentos" ? (
                <DocumentosTable
                  items={documentQuery.data?.items ?? []}
                  mode="unidade"
                  isReadOnly={isInactive}
                  isLoading={documentQuery.isPending}
                  isError={documentQuery.isError}
                  onRetry={() => void documentQuery.refetch()}
                  page={documentQuery.data?.page ?? page}
                  totalPages={documentQuery.data?.totalPages ?? 1}
                  total={documentQuery.data?.total ?? 0}
                  pageSize={documentQuery.data?.pageSize ?? 10}
                  onPageChange={(nextPage) => updateQuery({ page: nextPage })}
                />
              ) : (
                <TarefasTable
                  items={taskQuery.data?.items ?? []}
                  mode="unidade"
                  isReadOnly={isInactive}
                  isLoading={taskQuery.isPending}
                  isError={taskQuery.isError}
                  onRetry={() => void taskQuery.refetch()}
                  page={taskQuery.data?.page ?? page}
                  totalPages={taskQuery.data?.totalPages ?? 1}
                  total={taskQuery.data?.total ?? 0}
                  pageSize={taskQuery.data?.pageSize ?? 10}
                  onPageChange={(nextPage) => updateQuery({ page: nextPage })}
                />
              )}
            </section>
          </div>

          {statusToSet ? (
            <ConfirmDialog
              open
              title={
                statusToSet === "Inativa"
                  ? "Deseja desativar a unidade?"
                  : "Deseja ativar a unidade?"
              }
              description={
                statusToSet === "Inativa"
                  ? "Após a desativação os documentos e tarefas não poderão ser modificados, deseja prosseguir?"
                  : "Após a reativação os documentos e tarefas poderão ser modificados novamente, deseja prosseguir?"
              }
              cancelLabel="Cancelar"
              confirmLabel={
                statusToSet === "Inativa"
                  ? "Confirmar desativação"
                  : "Confirmar reativação"
              }
              isLoading={changeStatusMutation.isPending}
              onCancel={() => setStatusToSet(null)}
              onConfirm={confirmUnitStatus}
            />
          ) : null}
          <UnidadeInativaDialog
            unidade={unidade}
            open={inativaDialogOpen}
            onClose={() => setInativaDialogOpen(false)}
            onReturnToUnits={() => router.push("/unidades")}
          />
        </>
      )}
    </AppShell>
  );
}
