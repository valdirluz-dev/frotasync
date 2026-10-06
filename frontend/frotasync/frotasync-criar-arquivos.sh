#!/usr/bin/env bash
set -euo pipefail

# Execute na raiz de frontend/frotasync

mkdir -p 'app/(app)/documentos/[id]/editar'
cat > 'app/(app)/documentos/[id]/editar/page.tsx' <<'EOF_FROTASYNC'
import { notFound } from "next/navigation";

import { DocumentoEditarClient } from "@/components/edicao/DocumentoEditarClient";
import { obterDocumento } from "@/services/documentosService";
import { obterUnidade } from "@/services/dashboardService";

export default async function Page({ params }: PageProps<"/documentos/[id]/editar">) {
  const { id } = await params;
  const documento = await obterDocumento(id);
  if (!documento) notFound();
  const unidade = await obterUnidade(documento.unidadeId);
  if (!unidade) notFound();
  return <DocumentoEditarClient id={documento.id} unidadeId={unidade.id} />;
}
EOF_FROTASYNC

mkdir -p 'app/(app)/tarefas/[id]/editar'
cat > 'app/(app)/tarefas/[id]/editar/page.tsx' <<'EOF_FROTASYNC'
import { notFound } from "next/navigation";

import { TarefaEditarClient } from "@/components/edicao/TarefaEditarClient";
import { obterTarefa } from "@/services/tarefasService";
import { obterUnidade } from "@/services/dashboardService";

export default async function Page({ params }: PageProps<"/tarefas/[id]/editar">) {
  const { id } = await params;
  const tarefa = await obterTarefa(id);
  if (!tarefa) notFound();
  const unidade = await obterUnidade(tarefa.unidadeId);
  if (!unidade) notFound();
  return <TarefaEditarClient id={tarefa.id} unidadeId={unidade.id} />;
}
EOF_FROTASYNC

mkdir -p 'app/(app)/unidades/[id]/documentos/[docId]/editar'
cat > 'app/(app)/unidades/[id]/documentos/[docId]/editar/page.tsx' <<'EOF_FROTASYNC'
import { notFound } from "next/navigation";

import { DocumentoEditarClient } from "@/components/edicao/DocumentoEditarClient";
import { obterDocumento } from "@/services/documentosService";
import { obterUnidade } from "@/services/dashboardService";

export default async function Page({ params }: PageProps<"/unidades/[id]/documentos/[docId]/editar">) {
  const { id, docId } = await params;
  const [documento, unidade] = await Promise.all([obterDocumento(docId), obterUnidade(id)]);
  if (!documento || !unidade || documento.unidadeId !== id) notFound();
  return <DocumentoEditarClient id={documento.id} unidadeId={unidade.id} porUnidade />;
}
EOF_FROTASYNC

mkdir -p 'app/(app)/unidades/[id]/editar'
cat > 'app/(app)/unidades/[id]/editar/page.tsx' <<'EOF_FROTASYNC'
import { notFound } from "next/navigation";

import { UnidadeEditarClient } from "@/components/edicao/UnidadeEditarClient";
import { obterUnidadeParaEdicao } from "@/services/unidadesService";

export default async function Page({ params }: PageProps<"/unidades/[id]/editar">) {
  const { id } = await params;
  const unidade = await obterUnidadeParaEdicao(id);
  if (!unidade) notFound();
  return <UnidadeEditarClient id={unidade.id} />;
}
EOF_FROTASYNC

mkdir -p 'app/(app)/unidades/[id]/tarefas/[tarefaId]/editar'
cat > 'app/(app)/unidades/[id]/tarefas/[tarefaId]/editar/page.tsx' <<'EOF_FROTASYNC'
import { notFound } from "next/navigation";

import { TarefaEditarClient } from "@/components/edicao/TarefaEditarClient";
import { obterTarefa } from "@/services/tarefasService";
import { obterUnidade } from "@/services/dashboardService";

export default async function Page({ params }: PageProps<"/unidades/[id]/tarefas/[tarefaId]/editar">) {
  const { id, tarefaId } = await params;
  const [tarefa, unidade] = await Promise.all([obterTarefa(tarefaId), obterUnidade(id)]);
  if (!tarefa || !unidade || tarefa.unidadeId !== id) notFound();
  return <TarefaEditarClient id={tarefa.id} unidadeId={unidade.id} porUnidade />;
}
EOF_FROTASYNC

mkdir -p 'components/dashboard'
cat > 'components/dashboard/AppShell.tsx' <<'EOF_FROTASYNC'
"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

import { Icon } from "@/components/dashboard/Icons";

export function AppShell({
  activeTab,
  breadcrumb = "section",
  children,
}: {
  activeTab: "documentos" | "tarefas" | "unidades";
  breadcrumb?:
    | "section"
    | "newUnit"
    | { unitName: string; unitCode: string; tab: "documentos" | "tarefas" }
    | { custom: ReactNode };
  children: ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isUnitsSection = activeTab === "unidades";

  return (
    <div className="min-h-screen bg-[#F8F9FC] font-[Inter,ui-sans-serif,system-ui,sans-serif] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[300px] border-r border-slate-200 bg-white px-6 pt-5 lg:block">
        <Brand />
        <nav aria-label="Menu principal" className="mt-10 space-y-2">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${isUnitsSection ? "text-slate-600 hover:bg-slate-50" : "bg-indigo-50 font-semibold text-indigo-700"}`}>
            <Icon name="dashboard" />
            Dashboard
          </Link>
          <Link
            href="/unidades"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${isUnitsSection ? "bg-indigo-50 font-semibold text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}>
            <Icon name="units" />
            Unidades
          </Link>
          <a
            href="#"
            onClick={(event) => event.preventDefault()}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-slate-50">
            <Icon name="settings" />
            Configurações
          </a>
        </nav>
      </aside>

      {mobileMenuOpen ? (
        <div
          className="fixed inset-0 z-50 bg-slate-950/30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}>
          <aside
            className="h-full w-[min(300px,85vw)] bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between">
              <Brand />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Fechar menu"
                className="p-2 text-slate-500">
                ×
              </button>
            </div>
            <nav aria-label="Menu principal" className="mt-10 space-y-2">
              <Link
                onClick={() => setMobileMenuOpen(false)}
                href="/dashboard"
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${isUnitsSection ? "text-slate-600" : "bg-indigo-50 font-semibold text-indigo-700"}`}>
                <Icon name="dashboard" />
                Dashboard
              </Link>
              <Link
                onClick={() => setMobileMenuOpen(false)}
                href="/unidades"
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${isUnitsSection ? "bg-indigo-50 font-semibold text-indigo-700" : "text-slate-600"}`}>
                <Icon name="units" />
                Unidades
              </Link>
              <a
                href="#"
                onClick={(event) => event.preventDefault()}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600">
                <Icon name="settings" />
                Configurações
              </a>
            </nav>
          </aside>
        </div>
      ) : null}

      <div className="min-h-screen lg:ml-[300px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-7 xl:px-10">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Abrir menu"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden">
              <Icon name="menu" />
            </button>
            {typeof breadcrumb === "object" && "custom" in breadcrumb ? (
              breadcrumb.custom
            ) : isUnitsSection ? (
              breadcrumb === "newUnit" ? (
                <div className="hidden items-center gap-2 text-xs sm:flex">
                  <Link
                    href="/unidades"
                    className="text-slate-500 hover:text-indigo-700">
                    Unidades
                  </Link>
                  <span className="text-slate-300">/</span>
                  <span className="font-semibold text-slate-800">
                    Cadastrar Unidade
                  </span>
                </div>
              ) : typeof breadcrumb === "object" ? (
                <div className="hidden min-w-0 items-center gap-2 text-xs sm:flex">
                  <Link
                    href="/unidades"
                    className="shrink-0 text-slate-500 hover:text-indigo-700">
                    Unidades
                  </Link>
                  <span className="text-slate-300">/</span>
                  <span className="max-w-[220px] truncate text-slate-500">
                    {breadcrumb.unitName} (ID {breadcrumb.unitCode})
                  </span>
                  <span className="text-slate-300">/</span>
                  <span className="font-semibold capitalize text-slate-800">
                    {breadcrumb.tab}
                  </span>
                </div>
              ) : (
                <span className="hidden text-xs font-semibold text-slate-800 sm:block">
                  Unidades
                </span>
              )
            ) : (
              <div className="hidden items-center gap-2 text-xs sm:flex">
                <span className="text-slate-500">Dashboard Global</span>
                <span className="text-slate-300">/</span>
                <span className="font-semibold capitalize text-slate-800">
                  {activeTab}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <label className="hidden h-10 w-[220px] items-center gap-2 rounded-xl border border-slate-200 bg-[#F8F9FC] px-3 text-slate-400 md:flex xl:w-[270px]">
              <Icon name="search" className="h-4 w-4" />
              <input
                aria-label="Buscar no sistema"
                placeholder="Buscar no sistema..."
                className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
              />
            </label>
            <button
              type="button"
              aria-label="Notificações"
              className="relative text-slate-500">
              <Icon name="bell" className="h-[18px] w-[18px]" />
              <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            <button type="button" aria-label="Ajuda" className="text-slate-500">
              <Icon name="help" className="h-[18px] w-[18px]" />
            </button>
            <span className="hidden h-8 border-l border-slate-200 sm:block" />
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-[10px] font-semibold text-slate-600">
                JS
              </div>
              <div className="hidden leading-tight sm:block">
                <div className="text-xs font-semibold text-slate-800">
                  Murilo Pussa
                </div>
                <div className="mt-0.5 text-[10px] text-slate-400">
                  Administrador
                </div>
              </div>
              <Icon
                name="chevron"
                className="hidden h-4 w-4 text-slate-400 sm:block"
              />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1680px] px-4 pb-10 pt-7 sm:px-7 lg:px-8 xl:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
        <Icon name="truck" className="h-6 w-6" />
      </div>
      <div>
        <div className="text-[15px] font-bold tracking-tight text-slate-900">
          FrotaSync
        </div>
        <div className="text-[8px] font-semibold tracking-[0.14em] text-slate-400">
          GESTÃO INTELIGENTE
        </div>
      </div>
    </div>
  );
}
EOF_FROTASYNC

mkdir -p 'components/dashboard'
cat > 'components/dashboard/DashboardClient.tsx' <<'EOF_FROTASYNC'
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
EOF_FROTASYNC

mkdir -p 'components/documentos'
cat > 'components/documentos/DocumentoForm.tsx' <<'EOF_FROTASYNC'
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button, FormField, Input, Select, Textarea } from "@/components/ui";
import { calcularStatusDocumento } from "@/lib/status";
import { documentoSchema, type DocumentoFormInput, type DocumentoFormValues } from "@/schemas/documento";
import type { Documento, DocumentoAnexo } from "@/types/dashboard";

const maxFileSize = 10 * 1024 * 1024;

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type DocumentoFormProps = {
  documento: Documento;
  unidadeNome: string;
  categorias: string[];
  mode?: "criar" | "editar";
  defaultValues?: Partial<DocumentoFormInput>;
  isSaving?: boolean;
  onSubmit: SubmitHandler<DocumentoFormValues>;
  onCancel: () => void;
  onNoChanges?: () => void;
};

export function DocumentoForm({ documento, unidadeNome, categorias, mode = "editar", defaultValues, isSaving = false, onSubmit, onCancel, onNoChanges }: DocumentoFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | undefined>();
  const initial = useMemo<DocumentoFormInput>(() => ({
    nome: documento.nome,
    categoria: documento.categoria,
    dataEmissao: documento.dataEmissao ?? "",
    dataValidade: documento.dataValidade,
    descricao: documento.descricao ?? "",
    ...defaultValues,
  }), [defaultValues, documento]);

  const { register, handleSubmit, watch, setError, formState: { errors, isDirty, isSubmitting } } = useForm<DocumentoFormInput, unknown, DocumentoFormValues>({
    resolver: zodResolver(documentoSchema),
    defaultValues: initial,
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  useEffect(() => {
    if (!selectedFile) return;
    if (selectedFile.size > maxFileSize) setError("anexo", { type: "validate", message: "O arquivo deve ter no máximo 10 MB." });
  }, [selectedFile, setError]);

  const validade = watch("dataValidade");
  const descricao = watch("descricao") ?? "";
  const statusPreview = validade ? calcularStatusDocumento(validade) : null;
  const busy = isSaving || isSubmitting;

  function error(field: keyof DocumentoFormInput) {
    const message = errors[field]?.message;
    return typeof message === "string" ? message : undefined;
  }

  function submit(values: DocumentoFormValues) {
    if (mode === "editar" && !isDirty) {
      onNoChanges?.();
      return;
    }
    if (selectedFile) {
      if (selectedFile.size > maxFileSize) return;
      if (!["application/pdf", "image/jpeg", "image/png"].includes(selectedFile.type)) {
        setError("anexo", { type: "validate", message: "Envie um PDF, JPG ou PNG." });
        return;
      }
    }
    onSubmit({ ...values, anexo: selectedFile });
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="grid grid-cols-1 gap-x-10 gap-y-7 lg:grid-cols-2">
      <div className="space-y-5">
        <FormField id="documento-nome" label="Nome do documento" required error={error("nome")}>
          <Input id="documento-nome" aria-required="true" aria-invalid={Boolean(errors.nome)} placeholder="Digite o nome do documento..." {...register("nome")} />
        </FormField>
        <FormField id="documento-unidade" label="Unidade" required>
          <div className="relative">
            <Input id="documento-unidade" value={`${unidadeNome} (ID ${documento.unidadeId})`} readOnly aria-readonly="true" className="pr-12 bg-slate-50 text-slate-500" />
            <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">🔒</span>
          </div>
        </FormField>
        <FormField id="documento-categoria" label="Categoria" required error={error("categoria")}>
          <Select id="documento-categoria" aria-required="true" aria-invalid={Boolean(errors.categoria)} {...register("categoria")}>
            <option value="">Selecione a categoria</option>
            {categorias.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}
          </Select>
        </FormField>
        <FormField id="documento-descricao" label="Descrição" error={error("descricao")}>
          <Textarea id="documento-descricao" aria-invalid={Boolean(errors.descricao)} placeholder="Descreva o documento..." maxLength={500} {...register("descricao")} />
          <div className="mt-1 text-right text-xs text-slate-400">{descricao.length}/500</div>
        </FormField>
      </div>

      <div className="space-y-5">
        <FormField id="data-emissao" label="Data de emissão" required error={error("dataEmissao")}>
          <Input id="data-emissao" type="date" aria-required="true" aria-invalid={Boolean(errors.dataEmissao)} {...register("dataEmissao")} />
        </FormField>
        <FormField id="data-validade" label="Data de vencimento" required error={error("dataValidade")} action={statusPreview ? <StatusBadge status={statusPreview} /> : null}>
          <Input id="data-validade" type="date" aria-required="true" aria-invalid={Boolean(errors.dataValidade)} {...register("dataValidade")} />
        </FormField>
        <FormField id="documento-anexo" label="Anexo" error={error("anexo")}>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{documento.anexo?.nome ?? "Nenhum arquivo anexado"}</p>
                {documento.anexo ? <p className="mt-1 text-xs text-slate-500">{formatFileSize(documento.anexo.tamanhoBytes)}</p> : null}
              </div>
              <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                Substituir arquivo
                <input
                  id="documento-anexo"
                  type="file"
                  className="sr-only"
                  accept="application/pdf,image/jpeg,image/png"
                  aria-describedby={errors.anexo ? "documento-anexo-error" : undefined}
                  onChange={(event) => setSelectedFile(event.target.files?.[0])}
                />
              </label>
            </div>
            {selectedFile ? <p className="mt-3 text-xs font-medium text-indigo-700">Novo arquivo: {selectedFile.name} ({formatFileSize(selectedFile.size)})</p> : null}
          </div>
        </FormField>
      </div>

      <div className="flex flex-col gap-3 lg:col-start-1 lg:row-start-2 lg:flex-row">
        <Button type="button" variant="danger" disabled={busy} onClick={onCancel} leadingIcon={<span aria-hidden="true" className="text-base leading-none">−</span>} className="w-full rounded-xl lg:w-auto">Cancelar</Button>
        <Button type="submit" variant="success" disabled={busy} isLoading={busy} leadingIcon={<span aria-hidden="true" className="text-base leading-none">✓</span>} className="w-full rounded-xl lg:w-auto">Salvar alterações</Button>
      </div>
    </form>
  );
}

export function toDocumentoAnexo(file?: File): DocumentoAnexo | undefined {
  return file ? { nome: file.name, tamanhoBytes: file.size, tipo: file.type } : undefined;
}
EOF_FROTASYNC

mkdir -p 'components/documentos'
cat > 'components/documentos/DocumentosTable.tsx' <<'EOF_FROTASYNC'
"use client";

import { getCoreRowModel, useLegacyTable } from "@tanstack/react-table/legacy";
import Link from "next/link";

import { Icon } from "@/components/dashboard/Icons";
import { Pagination } from "@/components/dashboard/Pagination";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/dashboard/StateViews";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { calcularStatusDocumento } from "@/lib/status";
import type { Documento } from "@/types/dashboard";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(value: string | null) {
  if (!value) return "—";
  return dateFormatter.format(new Date(`${value.slice(0, 10)}T00:00:00.000Z`));
}

type DocumentosTableProps = {
  items: Documento[];
  mode: "global" | "unidade";
  isReadOnly?: boolean;
  unidadeNames?: ReadonlyMap<string, string>;
  unidadeStatuses?: ReadonlyMap<string, "Ativa" | "Inativa">;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  page?: number;
  totalPages?: number;
  total?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
};

export function DocumentosTable({
  items,
  mode,
  isReadOnly = false,
  unidadeNames,
  unidadeStatuses,
  isLoading,
  isError,
  onRetry,
  page = 1,
  totalPages = 1,
  total = 0,
  pageSize = 10,
  onPageChange,
}: DocumentosTableProps) {
  const table = useLegacyTable({
    data: items,
    columns: [{ accessorKey: "id", header: "id" }],
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });
  const showUnit = mode === "global";

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
      {isLoading ? (
        <LoadingState label="Carregando documentos..." />
      ) : isError ? (
        <ErrorState
          label="Não foi possível carregar os documentos."
          onRetry={onRetry}
        />
      ) : items.length === 0 ? (
        <EmptyState label="Nenhum documento encontrado para os filtros selecionados." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left">
            <thead>
              <tr>
                {[
                  "Documento",
                  ...(showUnit ? ["Unidade"] : []),
                  "Categoria",
                  "Emissão",
                  "Validade",
                  "Status",
                  "Ações",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-3 py-4 text-[11px] font-bold text-slate-800 first:pl-4">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.getRowModel().rows.map(({ original: document }) => {
                const rowIsReadOnly =
                  isReadOnly || unidadeStatuses?.get(document.unidadeId) === "Inativa";
                const href = mode === "unidade"
                  ? `/unidades/${document.unidadeId}/documentos/${document.id}/editar`
                  : `/documentos/${document.id}/editar`;
                return (
                  <tr key={document.id} className="hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-3 py-3 text-xs font-semibold text-slate-900 first:pl-4">
                      {document.nome}
                    </td>
                    {showUnit ? (
                      <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-700">
                        {unidadeNames?.get(document.unidadeId) ?? "—"}
                      </td>
                    ) : null}
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-700">{document.categoria}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs tabular-nums text-slate-700">{formatDate(document.dataEmissao)}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs tabular-nums text-slate-700">{formatDate(document.dataValidade)}</td>
                    <td className="px-3 py-3"><StatusBadge status={calcularStatusDocumento(document.dataValidade)} /></td>
                    <td className="px-3 py-3">
                      {rowIsReadOnly ? (
                        <button type="button" disabled title="Unidade inativa" className="inline-flex cursor-not-allowed items-center gap-1 rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-400">
                          <Icon name="edit" className="h-3 w-3" />
                          {mode === "unidade" ? "Editar informações" : "Editar"}
                        </button>
                      ) : (
                        <Link href={href} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[10px] font-medium text-slate-500 hover:border-indigo-200 hover:text-indigo-700">
                          <Icon name="edit" className="h-3 w-3" />
                          {mode === "unidade" ? "Editar informações" : "Editar"}
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {!isLoading && !isError ? (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          entity="documentos"
          onChange={onPageChange}
        />
      ) : null}
    </div>
  );
}
EOF_FROTASYNC

mkdir -p 'components/edicao'
cat > 'components/edicao/DocumentoEditarClient.tsx' <<'EOF_FROTASYNC'
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";

import { EditError } from "@/components/edicao/EditError";
import { EditLoading, EditPageShell } from "@/components/edicao/EditPageShell";
import { DocumentoForm, toDocumentoAnexo } from "@/components/documentos/DocumentoForm";
import { UnidadeInativaDialog } from "@/components/unidades/UnidadeInativaDialog";
import { ConfirmDialog, useToast } from "@/components/ui";
import { useDocumento, useEditarDocumento } from "@/hooks/useEdicao";
import { useUnidade } from "@/hooks/useUnidadeDetalhe";
import { mockCategorias } from "@/mocks/dashboard";
import type { DocumentoFormValues } from "@/schemas/documento";

export function DocumentoEditarClient({ id, unidadeId, porUnidade = false }: { id: string; unidadeId: string; porUnidade?: boolean }) {
  const router = useRouter();
  const { showToast } = useToast();
  const documentQuery = useDocumento(id);
  const unitQuery = useUnidade(unidadeId);
  const mutation = useEditarDocumento();
  const [pending, setPending] = useState<DocumentoFormValues | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const documento = documentQuery.data;
  const unidade = unitQuery.data;
  const inactive = unidade?.status === "Inativa";
  const base = porUnidade ? `/unidades/${unidadeId}?aba=documentos` : `/dashboard?aba=documentos`;
  const back = () => router.push(base);

  const submit: SubmitHandler<DocumentoFormValues> = (values) => { setPending(values); setDialogOpen(true); };
  async function confirm() {
    if (!pending || mutation.isPending) return;
    try {
      const updated = await mutation.mutateAsync({ id, data: pending, anexo: toDocumentoAnexo(pending.anexo) });
      setDialogOpen(false);
      showToast("Documento atualizado com sucesso", "success");
      router.push(`${base}&q=${encodeURIComponent(updated.nome)}`);
    } catch (error) {
      setDialogOpen(false);
      showToast(error instanceof Error && error.message.includes("inativa") ? "Não é possível modificar registros de uma unidade inativa." : "Não foi possível atualizar o documento. Tente novamente.", "error");
    }
  }

  if (documentQuery.isPending || unitQuery.isPending) return <EditPageShell activeTab="documentos" breadcrumb={<span>Dashboard Global / Documentos / Editar Documento</span>} title="Editar documento" backLabel="Voltar para documentos" onBack={back}><EditLoading /></EditPageShell>;
  if (documentQuery.isError || unitQuery.isError || !documento || !unidade || documento.unidadeId !== unidadeId) return <EditPageShell activeTab="documentos" breadcrumb={<span>Dashboard Global / Documentos / Editar Documento</span>} title="Editar documento" backLabel="Voltar para documentos" onBack={back}><EditError onRetry={() => { void documentQuery.refetch(); void unitQuery.refetch(); }} /></EditPageShell>;
  if (inactive) return <EditPageShell activeTab={porUnidade ? "unidades" : "documentos"} breadcrumb={<span>{porUnidade ? `Unidades / ${unidade.nome} (ID ${unidade.codigo}) / Documentos / Editar Documento` : "Dashboard Global / Documentos / Editar Documento"}</span>} title="Editar documento" backLabel="Voltar para documentos" onBack={back}><div className="h-20" /><UnidadeInativaDialog unidade={unidade} open resource="documento" onClose={back} onReturnToUnits={() => router.push("/unidades")} /></EditPageShell>;

  return (
    <EditPageShell
      activeTab={porUnidade ? "unidades" : "documentos"}
      breadcrumb={<><span className="text-slate-500">{porUnidade ? "Unidades" : "Dashboard Global"}</span><span className="text-slate-300">/</span>{porUnidade ? <><span className="max-w-[220px] truncate text-slate-500">{unidade.nome} (ID {unidade.codigo})</span><span className="text-slate-300">/</span></> : null}<span className="text-slate-500">Documentos</span><span className="text-slate-300">/</span><span className="font-semibold text-slate-800">Editar Documento</span></>}
      title="Editar documento"
      backLabel="Voltar para documentos"
      onBack={back}
    >
      <DocumentoForm documento={documento} unidadeNome={unidade.nome} categorias={mockCategorias} mode="editar" isSaving={mutation.isPending} onNoChanges={() => showToast("Nenhuma alteração para salvar", "info")} onCancel={back} onSubmit={submit} />
      <ConfirmDialog open={dialogOpen} title="Deseja salvar as alterações?" description={<p>Você está alterando o documento &quot;<strong>{documento.nome}</strong>&quot;, na unidade &quot;<strong>{unidade.nome} (ID {unidade.codigo})</strong>&quot;, deseja prosseguir com as alterações?</p>} cancelLabel="Cancelar" confirmLabel="Salvar alterações" isLoading={mutation.isPending} onCancel={() => { if (!mutation.isPending) setDialogOpen(false); }} onConfirm={confirm} />
    </EditPageShell>
  );
}
EOF_FROTASYNC

mkdir -p 'components/edicao'
cat > 'components/edicao/EditError.tsx' <<'EOF_FROTASYNC'
"use client";

export function EditError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
      <p className="font-semibold text-red-900">Não foi possível carregar os dados para edição.</p>
      <button type="button" onClick={onRetry} className="mt-4 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800">Tentar novamente</button>
    </div>
  );
}
EOF_FROTASYNC

mkdir -p 'components/edicao'
cat > 'components/edicao/EditPageShell.tsx' <<'EOF_FROTASYNC'
"use client";

import type { ReactNode } from "react";

import { AppShell } from "@/components/dashboard/AppShell";
import { Icon } from "@/components/dashboard/Icons";
import { Button } from "@/components/ui";

export function EditPageShell({
  activeTab,
  breadcrumb,
  title,
  backLabel,
  onBack,
  children,
}: {
  activeTab: "documentos" | "tarefas" | "unidades";
  breadcrumb: ReactNode;
  title: string;
  backLabel: string;
  onBack: () => void;
  children: ReactNode;
}) {
  return (
    <AppShell activeTab={activeTab} breadcrumb={{ custom: breadcrumb }}>
      <section className="mx-auto max-w-[1280px]">
        <Button type="button" variant="primary" leadingIcon={<Icon name="left" className="h-4 w-4" />} onClick={onBack} className="rounded-lg px-3.5 py-2 text-xs">
          {backLabel}
        </Button>
        <h1 className="mb-7 mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">{title}</h1>
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7 lg:p-9">{children}</div>
      </section>
    </AppShell>
  );
}

export function EditLoading() {
  return <div className="grid grid-cols-1 gap-7 lg:grid-cols-2" role="status" aria-label="Carregando formulário de edição">{Array.from({ length: 8 }, (_, index) => <div key={index} className="h-12 animate-pulse rounded-2xl bg-slate-200" />)}</div>;
}
EOF_FROTASYNC

mkdir -p 'components/edicao'
cat > 'components/edicao/TarefaEditarClient.tsx' <<'EOF_FROTASYNC'
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";

import { EditError } from "@/components/edicao/EditError";
import { EditLoading, EditPageShell } from "@/components/edicao/EditPageShell";
import { TarefaForm } from "@/components/tarefas/TarefaForm";
import { UnidadeInativaDialog } from "@/components/unidades/UnidadeInativaDialog";
import { ConfirmDialog, useToast } from "@/components/ui";
import { useEditarTarefa, useTarefa } from "@/hooks/useEdicao";
import { useUnidade } from "@/hooks/useUnidadeDetalhe";
import type { TarefaFormValues } from "@/schemas/tarefa";

export function TarefaEditarClient({ id, unidadeId, porUnidade = false }: { id: string; unidadeId: string; porUnidade?: boolean }) {
  const router = useRouter();
  const { showToast } = useToast();
  const taskQuery = useTarefa(id);
  const unitQuery = useUnidade(unidadeId);
  const mutation = useEditarTarefa();
  const [pending, setPending] = useState<TarefaFormValues | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const tarefa = taskQuery.data;
  const unidade = unitQuery.data;
  const inactive = unidade?.status === "Inativa";
  const base = porUnidade ? `/unidades/${unidadeId}?aba=tarefas` : `/dashboard?aba=tarefas`;
  const back = () => router.push(base);

  const submit: SubmitHandler<TarefaFormValues> = (values) => { setPending(values); setDialogOpen(true); };
  async function confirm() {
    if (!pending || mutation.isPending) return;
    try {
      const updated = await mutation.mutateAsync({ id, data: pending });
      setDialogOpen(false);
      showToast("Tarefa atualizada com sucesso", "success");
      router.push(`${base}&q=${encodeURIComponent(updated.titulo)}`);
    } catch (error) {
      setDialogOpen(false);
      showToast(error instanceof Error && error.message.includes("inativa") ? "Não é possível modificar registros de uma unidade inativa." : "Não foi possível atualizar a tarefa. Tente novamente.", "error");
    }
  }

  if (taskQuery.isPending || unitQuery.isPending) return <EditPageShell activeTab="tarefas" breadcrumb={<span>Dashboard Global / Tarefas / Editar Tarefa</span>} title="Editar Tarefa" backLabel="Voltar para tarefas" onBack={back}><EditLoading /></EditPageShell>;
  if (taskQuery.isError || unitQuery.isError || !tarefa || !unidade || tarefa.unidadeId !== unidadeId) return <EditPageShell activeTab="tarefas" breadcrumb={<span>Dashboard Global / Tarefas / Editar Tarefa</span>} title="Editar Tarefa" backLabel="Voltar para tarefas" onBack={back}><EditError onRetry={() => { void taskQuery.refetch(); void unitQuery.refetch(); }} /></EditPageShell>;
  if (inactive) return <EditPageShell activeTab={porUnidade ? "unidades" : "tarefas"} breadcrumb={<span>{porUnidade ? `Unidades / ${unidade.nome} (ID ${unidade.codigo}) / Tarefas / Editar Tarefa` : "Dashboard Global / Tarefas / Editar Tarefa"}</span>} title="Editar Tarefa" backLabel="Voltar para tarefas" onBack={back}><div className="h-20" /><UnidadeInativaDialog unidade={unidade} open resource="tarefa" onClose={back} onReturnToUnits={() => router.push("/unidades")} /></EditPageShell>;

  return (
    <EditPageShell
      activeTab={porUnidade ? "unidades" : "tarefas"}
      breadcrumb={<><span className="text-slate-500">{porUnidade ? "Unidades" : "Dashboard Global"}</span><span className="text-slate-300">/</span>{porUnidade ? <><span className="max-w-[220px] truncate text-slate-500">{unidade.nome} (ID {unidade.codigo})</span><span className="text-slate-300">/</span></> : null}<span className="text-slate-500">Tarefas</span><span className="text-slate-300">/</span><span className="font-semibold text-slate-800">Editar Tarefa</span></>}
      title="Editar Tarefa"
      backLabel="Voltar para tarefas"
      onBack={back}
    >
      <TarefaForm tarefa={tarefa} unidadeNome={unidade.nome} mode="editar" isSaving={mutation.isPending} onNoChanges={() => showToast("Nenhuma alteração para salvar", "info")} onCancel={back} onSubmit={submit} />
      <ConfirmDialog open={dialogOpen} title="Deseja salvar as alterações?" description={<p>Você está alterando a tarefa &quot;<strong>{tarefa.titulo}</strong>&quot;, na unidade &quot;<strong>{unidade.nome} (ID {unidade.codigo})</strong>&quot;, deseja prosseguir com as alterações?</p>} cancelLabel="Cancelar" confirmLabel="Salvar alterações" isLoading={mutation.isPending} onCancel={() => { if (!mutation.isPending) setDialogOpen(false); }} onConfirm={confirm} />
    </EditPageShell>
  );
}
EOF_FROTASYNC

mkdir -p 'components/edicao'
cat > 'components/edicao/UnidadeEditarClient.tsx' <<'EOF_FROTASYNC'
"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SubmitHandler } from "react-hook-form";

import { EditError } from "@/components/edicao/EditError";
import { EditLoading } from "@/components/edicao/EditPageShell";
import { EditPageShell } from "@/components/edicao/EditPageShell";
import { UnidadeForm, type UnidadeFormHandle } from "@/components/unidades/UnidadeForm";
import { ConfirmDialog } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { useEditarUnidade, useUnidadeParaEdicao } from "@/hooks/useEdicao";
import { IdentificadorUnidadeDuplicadoError } from "@/services/unidadesService";
import type { UnidadeFormValues } from "@/schemas/unidade";

function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

export function UnidadeEditarClient({ id }: { id: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const query = useUnidadeParaEdicao(id);
  const mutation = useEditarUnidade();
  const formRef = useRef<UnidadeFormHandle>(null);
  const [pending, setPending] = useState<UnidadeFormValues | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const unidade = query.data;

  const submit: SubmitHandler<UnidadeFormValues> = useCallback((values) => {
    setPending(values);
    setDialogOpen(true);
  }, []);

  async function confirm() {
    if (!pending || mutation.isPending) return;
    try {
      const updated = await mutation.mutateAsync({ id, data: pending });
      setDialogOpen(false);
      showToast("Unidade atualizada com sucesso", "success");
      router.push(`/unidades/${updated.id}`);
    } catch (error) {
      setDialogOpen(false);
      if (error instanceof IdentificadorUnidadeDuplicadoError) {
        formRef.current?.setIdentifierError(error.message);
        window.requestAnimationFrame(() => formRef.current?.focusIdentifier());
      } else {
        showToast("Não foi possível atualizar a unidade. Tente novamente.", "error");
      }
    }
  }

  if (query.isPending && !unidade) return <EditPageShell activeTab="unidades" breadcrumb={<span>Unidades / Editar</span>} title="Editar unidade" backLabel="Voltar para unidade" onBack={() => router.push(`/unidades/${id}`)}><EditLoading /></EditPageShell>;
  if (query.isError || !unidade) return <EditPageShell activeTab="unidades" breadcrumb={<span>Unidades / Editar</span>} title="Editar unidade" backLabel="Voltar para unidade" onBack={() => router.push(`/unidades/${id}`)}><EditError onRetry={() => void query.refetch()} /></EditPageShell>;

  return (
    <EditPageShell
      activeTab="unidades"
      breadcrumb={<><span className="text-slate-500">Unidades</span><span className="text-slate-300">/</span><span className="max-w-[240px] truncate text-slate-500">{unidade.nome} (ID {unidade.codigo})</span><span className="text-slate-300">/</span><span className="font-semibold text-slate-800">Editar</span></>}
      title="Editar unidade"
      backLabel="Voltar para unidade"
      onBack={() => router.push(`/unidades/${id}`)}
    >
      <p className="-mt-4 mb-7 text-xs text-slate-400">Criada em {formatDate(unidade.criadoEm)} · Última modificação {formatDate(unidade.atualizadoEm)}</p>
      <UnidadeForm
        ref={formRef}
        mode="editar"
        isSaving={mutation.isPending}
        defaultValues={{ nome: unidade.nome, identificador: unidade.codigo, cep: unidade.endereco.cep ?? "", logradouro: unidade.endereco.logradouro, numero: unidade.endereco.numero, complemento: unidade.endereco.complemento ?? "", bairro: unidade.endereco.bairro, cidade: unidade.endereco.cidade, uf: unidade.endereco.uf, descricao: unidade.descricao ?? "" }}
        onNoChanges={() => showToast("Nenhuma alteração para salvar", "info")}
        onCancel={() => router.push(`/unidades/${id}`)}
        onSubmit={submit}
      />
      <ConfirmDialog
        open={dialogOpen}
        title="Deseja salvar as alterações?"
        description={<p>Você está alterando a unidade &quot;<strong>{unidade.nome} (ID {unidade.codigo})</strong>&quot;, deseja prosseguir com as alterações?</p>}
        cancelLabel="Cancelar"
        confirmLabel="Salvar alterações"
        isLoading={mutation.isPending}
        onCancel={() => { if (!mutation.isPending) setDialogOpen(false); }}
        onConfirm={confirm}
      />
    </EditPageShell>
  );
}
EOF_FROTASYNC

mkdir -p 'components/tarefas'
cat > 'components/tarefas/TarefaForm.tsx' <<'EOF_FROTASYNC'
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";

import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button, FormField, Input, Textarea } from "@/components/ui";
import { tarefaSchema, prazoAlteradoValido, type TarefaFormInput, type TarefaFormValues } from "@/schemas/tarefa";
import type { Tarefa } from "@/types/dashboard";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(new Date(`${value.slice(0, 10)}T00:00:00.000Z`));
}

type TarefaFormProps = {
  tarefa: Tarefa;
  unidadeNome: string;
  mode?: "criar" | "editar";
  defaultValues?: Partial<TarefaFormInput>;
  isSaving?: boolean;
  onSubmit: SubmitHandler<TarefaFormValues>;
  onCancel: () => void;
  onNoChanges?: () => void;
};

export function TarefaForm({ tarefa, unidadeNome, mode = "editar", defaultValues, isSaving = false, onSubmit, onCancel, onNoChanges }: TarefaFormProps) {
  const initial: TarefaFormInput = {
    titulo: tarefa.titulo,
    prazoFinal: tarefa.prazoFinal,
    descricao: tarefa.descricao ?? "",
    ...defaultValues,
  };
  const { register, handleSubmit, watch, setError, formState: { errors, isDirty, isSubmitting } } = useForm<TarefaFormInput, unknown, TarefaFormValues>({
    resolver: zodResolver(tarefaSchema),
    defaultValues: initial,
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });
  const prazo = watch("prazoFinal");
  const descricao = watch("descricao") ?? "";
  const busy = isSaving || isSubmitting;

  function fieldError(field: keyof TarefaFormInput) {
    const message = errors[field]?.message;
    return typeof message === "string" ? message : undefined;
  }

  function submit(values: TarefaFormValues) {
    if (mode === "editar" && !isDirty) {
      onNoChanges?.();
      return;
    }
    if (!prazoAlteradoValido(values.prazoFinal, tarefa.prazoFinal)) {
      setError("prazoFinal", { type: "validate", message: "O prazo não pode ser anterior a hoje quando alterado." });
      return;
    }
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="grid grid-cols-1 gap-x-10 gap-y-7 lg:grid-cols-2">
      <div className="space-y-5">
        <FormField id="tarefa-titulo" label="Título" required error={fieldError("titulo")}>
          <Input id="tarefa-titulo" aria-required="true" aria-invalid={Boolean(errors.titulo)} placeholder="Digite o título da tarefa..." {...register("titulo")} />
        </FormField>
        <FormField id="tarefa-unidade" label="Unidade" required>
          <div className="relative">
            <Input id="tarefa-unidade" value={`${unidadeNome} (ID ${tarefa.unidadeId})`} readOnly aria-readonly="true" className="pr-12 bg-slate-50 text-slate-500" />
            <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">🔒</span>
          </div>
        </FormField>
        <FormField id="tarefa-descricao" label="Descrição" error={fieldError("descricao")}>
          <Textarea id="tarefa-descricao" aria-invalid={Boolean(errors.descricao)} placeholder="Descreva a tarefa..." maxLength={500} {...register("descricao")} />
          <div className="mt-1 text-right text-xs text-slate-400">{descricao.length}/500</div>
        </FormField>
      </div>

      <div className="space-y-5">
        <FormField id="tarefa-prazo" label="Prazo final" required error={fieldError("prazoFinal")}>
          <Input id="tarefa-prazo" type="date" aria-required="true" aria-invalid={Boolean(errors.prazoFinal)} {...register("prazoFinal")} />
        </FormField>
        <FormField id="tarefa-status" label="Status">
          <div className="flex h-12 items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4" aria-readonly="true">
            <StatusBadge status={tarefa.status} />
            <span className="text-xs text-slate-500">O status é alterado na lista de tarefas</span>
          </div>
        </FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="tarefa-inicio" label="Data de início">
            <Input id="tarefa-inicio" value={formatDate(tarefa.dataInicio)} readOnly aria-readonly="true" className="bg-slate-50 text-slate-500" />
          </FormField>
          <FormField id="tarefa-conclusao" label="Data de conclusão">
            <Input id="tarefa-conclusao" value={formatDate(tarefa.dataConclusao)} readOnly aria-readonly="true" className="bg-slate-50 text-slate-500" />
          </FormField>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:col-start-1 lg:row-start-2 lg:flex-row">
        <Button type="button" variant="danger" disabled={busy} onClick={onCancel} leadingIcon={<span aria-hidden="true" className="text-base leading-none">−</span>} className="w-full rounded-xl lg:w-auto">Cancelar</Button>
        <Button type="submit" variant="success" disabled={busy} isLoading={busy} leadingIcon={<span aria-hidden="true" className="text-base leading-none">✓</span>} className="w-full rounded-xl lg:w-auto">Salvar alterações</Button>
      </div>
    </form>
  );
}
EOF_FROTASYNC

mkdir -p 'components/tarefas'
cat > 'components/tarefas/TarefasTable.tsx' <<'EOF_FROTASYNC'
"use client";

import { getCoreRowModel, useLegacyTable } from "@tanstack/react-table/legacy";
import Link from "next/link";

import { Icon } from "@/components/dashboard/Icons";
import { Pagination } from "@/components/dashboard/Pagination";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/dashboard/StateViews";
import { TaskStatusSelect } from "@/components/tarefas/TaskStatusSelect";
import type { Tarefa, UnidadeStatus } from "@/types/dashboard";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});
const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value.length === 10 ? `${value}T00:00:00.000Z` : value);
  return dateFormatter.format(date);
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  const date = new Date(value.length === 10 ? `${value}T00:00:00.000Z` : value);
  return `${dateFormatter.format(date)} | ${timeFormatter.format(date)}`;
}

type TarefasTableProps = {
  items: Tarefa[];
  mode: "global" | "unidade";
  isReadOnly?: boolean;
  unidadeNames?: ReadonlyMap<string, string>;
  unidadeStatuses?: ReadonlyMap<string, UnidadeStatus>;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  page?: number;
  totalPages?: number;
  total?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
};

export function TarefasTable({
  items,
  mode,
  isReadOnly = false,
  unidadeNames,
  unidadeStatuses,
  isLoading,
  isError,
  onRetry,
  page = 1,
  totalPages = 1,
  total = 0,
  pageSize = 10,
  onPageChange,
}: TarefasTableProps) {
  const table = useLegacyTable({
    data: items,
    columns: [{ accessorKey: "id", header: "id" }],
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });
  const showUnit = mode === "global";

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
      {isLoading ? (
        <LoadingState label="Carregando tarefas..." />
      ) : isError ? (
        <ErrorState
          label="Não foi possível carregar as tarefas."
          onRetry={onRetry}
        />
      ) : items.length === 0 ? (
        <EmptyState label="Nenhuma tarefa encontrada para os filtros selecionados." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-separate border-spacing-0 text-left">
            <thead>
              <tr>
                {[
                  "Tarefa",
                  ...(showUnit ? ["Unidade"] : []),
                  "Data de início",
                  "Prazo final",
                  "Status",
                  "Data de conclusão",
                  "Ações",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-3 py-4 text-[11px] font-bold text-slate-800 first:pl-4">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.getRowModel().rows.map(({ original: task }) => {
                const rowIsReadOnly =
                  isReadOnly ||
                  unidadeStatuses?.get(task.unidadeId) === "Inativa";

                return (
                  <tr key={task.id} className="hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-3 py-3 text-xs font-semibold text-slate-900 first:pl-4">
                      {task.titulo}
                    </td>
                    {showUnit ? (
                      <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-700">
                        {unidadeNames?.get(task.unidadeId) ?? "—"}
                      </td>
                    ) : null}
                    <td className="whitespace-nowrap px-3 py-3 text-xs tabular-nums text-slate-700">
                      {formatDate(task.dataInicio)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs tabular-nums text-slate-700">
                      {formatDate(task.prazoFinal)}
                    </td>
                    <td className="px-3 py-3">
                      <TaskStatusSelect
                        tarefa={task}
                        disabled={rowIsReadOnly}
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-700">
                      <span className="inline-flex rounded-md bg-slate-100 px-2 py-1 tabular-nums text-[10px] text-slate-600">
                        {formatDateTime(task.dataConclusao)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        disabled={rowIsReadOnly}
                        title={rowIsReadOnly ? "Unidade inativa" : undefined}
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-medium disabled:cursor-not-allowed ${rowIsReadOnly ? "border-slate-200 bg-slate-100 text-slate-400" : "border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-700"}`}>
                        {rowIsReadOnly ? <><Icon name="edit" className="h-3 w-3" />Editar</> : <Link href={mode === "unidade" ? `/unidades/${task.unidadeId}/tarefas/${task.id}/editar` : `/tarefas/${task.id}/editar`} className="inline-flex items-center gap-1"><Icon name="edit" className="h-3 w-3" />Editar</Link>}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {!isLoading && !isError ? (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          entity="tarefas"
          onChange={onPageChange}
        />
      ) : null}
    </div>
  );
}
EOF_FROTASYNC

mkdir -p 'components/unidades'
cat > 'components/unidades/UnidadeForm.tsx' <<'EOF_FROTASYNC'
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef, useImperativeHandle, useState } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";

import { useBuscarCep } from "@/hooks/useBuscarCep";
import { formatarCep, normalizarCep } from "@/lib/cep";
import { unidadeSchema } from "@/schemas/unidade";
import type { UnidadeFormInput, UnidadeFormValues } from "@/schemas/unidade";
import { Button, FormField, Input, Textarea } from "@/components/ui";
import { UnidadeSelect } from "@/components/unidades/UnidadeSelect";

type UnidadeFormProps = {
  onSubmit: SubmitHandler<UnidadeFormValues>;
  onCancel: () => void;
  defaultValues?: Partial<UnidadeFormInput>;
  mode?: "criar" | "editar";
  isSaving?: boolean;
  onNoChanges?: () => void;
};

export type UnidadeFormHandle = {
  setIdentifierError: (message: string) => void;
  focusIdentifier: () => void;
};

const initialValues: UnidadeFormInput = {
  nome: "",
  identificador: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  cidade: "",
  bairro: "",
  uf: "PE",
  descricao: "",
};

export const UnidadeForm = forwardRef<UnidadeFormHandle, UnidadeFormProps>(
  function UnidadeForm(
    { onSubmit, onCancel, defaultValues, mode = "criar", isSaving = false, onNoChanges },
    ref,
  ) {
    const {
      register,
      control,
      handleSubmit,
      setValue,
      setFocus,
      setError,
      watch,
      formState: { errors, isSubmitting, isDirty },
    } = useForm<UnidadeFormInput, unknown, UnidadeFormValues>({
      resolver: zodResolver(unidadeSchema),
      defaultValues: { ...initialValues, ...defaultValues },
      mode: "onSubmit",
      reValidateMode: "onChange",
      shouldFocusError: true,
    });
    useImperativeHandle(
      ref,
      () => ({
        setIdentifierError: (message) =>
          setError("identificador", { type: "server", message }),
        focusIdentifier: () => setFocus("identificador"),
      }),
      [setError, setFocus],
    );
    const cepMutation = useBuscarCep();
    const cep = watch("cep");
    const [cepMessage, setCepMessage] = useState<string | null>(null);
    const busy = isSaving || isSubmitting;

    function handleValidSubmit(values: UnidadeFormValues) {
      if (mode === "editar" && !isDirty) {
        onNoChanges?.();
        return;
      }
      onSubmit(values);
    }
    const cepReady = normalizarCep(cep ?? "").length === 8;

    function fieldError(field: keyof UnidadeFormInput): string | undefined {
      const message = errors[field]?.message;
      return typeof message === "string" ? message : undefined;
    }

    function describedBy(field: keyof UnidadeFormInput, extraId?: string) {
      const ids = [fieldError(field) ? `${field}-error` : null, extraId]
        .filter(Boolean)
        .join(" ");
      return ids || undefined;
    }

    async function handleCepLookup() {
      setCepMessage(null);
      try {
        const address = await cepMutation.mutateAsync(normalizarCep(cep ?? ""));
        if (!address) {
          setCepMessage("CEP não encontrado. Preencha o endereço manualmente.");
          return;
        }

        setValue("logradouro", address.logradouro, {
          shouldDirty: true,
          shouldValidate: true,
        });
        setValue("bairro", address.bairro, {
          shouldDirty: true,
          shouldValidate: true,
        });
        setValue("cidade", address.cidade, {
          shouldDirty: true,
          shouldValidate: true,
        });
        setValue("uf", address.uf, {
          shouldDirty: true,
          shouldValidate: true,
        });
        setFocus("numero");
      } catch {
        setCepMessage(
          "Não foi possível buscar o CEP. Preencha o endereço manualmente.",
        );
      }
    }

    return (
      <form
        onSubmit={handleSubmit(handleValidSubmit)}
        noValidate
        className="grid grid-cols-1 gap-x-10 gap-y-7 lg:grid-cols-2">
        <div className="space-y-5">
          <FormField
            id="nome"
            label="Nome da unidade"
            required
            error={fieldError("nome")}>
            <Input
              id="nome"
              autoComplete="organization"
              aria-required="true"
              aria-invalid={Boolean(errors.nome)}
              aria-describedby={describedBy("nome")}
              placeholder="Digite o nome da unidade..."
              {...register("nome")}
            />
          </FormField>

          <FormField
            id="identificador"
            label="Identificador da Unidade"
            required
            error={fieldError("identificador")}>
            <Input
              id="identificador"
              aria-required="true"
              aria-invalid={Boolean(errors.identificador)}
              aria-describedby={describedBy("identificador")}
              placeholder="Exemplo: 002"
              maxLength={10}
              {...register("identificador")}
            />
          </FormField>

          <FormField
            id="cep"
            label="CEP"
            required
            error={fieldError("cep")}
            action={
              <Button
                type="button"
                variant="outline"
                disabled={!cepReady || cepMutation.isPending || busy}
                isLoading={cepMutation.isPending}
                onClick={() => void handleCepLookup()}
                className="rounded-lg px-3 py-1.5 text-xs shadow-none">
                Buscar CEP
              </Button>
            }>
            <Controller
              control={control}
              name="cep"
              render={({ field }) => (
                <Input
                  {...field}
                  id="cep"
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  aria-required="true"
                  aria-invalid={Boolean(errors.cep)}
                  aria-describedby={describedBy("cep", "cep-lookup-message")}
                  placeholder="Exemplo: 50000-000"
                  maxLength={9}
                  value={field.value ?? ""}
                  onChange={(event) => {
                    setCepMessage(null);
                    field.onChange(formatarCep(event.target.value));
                  }}
                />
              )}
            />
            <p
              id="cep-lookup-message"
              aria-live="polite"
              className={`mt-1.5 text-xs ${cepMessage ? "font-medium text-amber-800" : "sr-only"}`}>
              {cepMessage ?? ""}
            </p>
          </FormField>
        </div>

        <div className="grid grid-cols-12 gap-x-4 gap-y-5">
          <div className="col-span-12 sm:col-span-8">
            <FormField
              id="logradouro"
              label="Logradouro"
              required
              error={fieldError("logradouro")}>
              <Input
                id="logradouro"
                autoComplete="address-line1"
                aria-required="true"
                aria-invalid={Boolean(errors.logradouro)}
                aria-describedby={describedBy("logradouro")}
                placeholder="Avenida Exemplo"
                {...register("logradouro")}
              />
            </FormField>
          </div>
          <div className="col-span-12 sm:col-span-4">
            <FormField
              id="numero"
              label="Número"
              required
              error={fieldError("numero")}>
              <Input
                id="numero"
                autoComplete="address-line2"
                aria-required="true"
                aria-invalid={Boolean(errors.numero)}
                aria-describedby={describedBy("numero")}
                placeholder="123"
                maxLength={10}
                {...register("numero")}
              />
            </FormField>
          </div>

          <div className="col-span-12 sm:col-span-4">
            <FormField
              id="complemento"
              label="Complemento"
              error={fieldError("complemento")}>
              <Input
                id="complemento"
                aria-required="false"
                aria-invalid={Boolean(errors.complemento)}
                aria-describedby={describedBy("complemento")}
                placeholder="Ex: Galpão 2"
                maxLength={100}
                {...register("complemento")}
              />
            </FormField>
          </div>
          <div className="col-span-12 sm:col-span-8">
            <FormField
              id="cidade"
              label="Cidade"
              required
              error={fieldError("cidade")}>
              <Input
                id="cidade"
                autoComplete="address-level2"
                aria-required="true"
                aria-invalid={Boolean(errors.cidade)}
                aria-describedby={describedBy("cidade")}
                placeholder="Ex: Recife"
                {...register("cidade")}
              />
            </FormField>
          </div>

          <div className="col-span-12 sm:col-span-8">
            <FormField
              id="bairro"
              label="Bairro"
              required
              error={fieldError("bairro")}>
              <Input
                id="bairro"
                autoComplete="address-level3"
                aria-required="true"
                aria-invalid={Boolean(errors.bairro)}
                aria-describedby={describedBy("bairro")}
                placeholder="Ex: Centro"
                {...register("bairro")}
              />
            </FormField>
          </div>
          <div className="col-span-12 sm:col-span-4">
            <FormField id="uf" label="UF" required error={fieldError("uf")}>
              <UnidadeSelect
                id="uf"
                aria-required="true"
                aria-invalid={Boolean(errors.uf)}
                aria-describedby={describedBy("uf")}
                {...register("uf")}
              />
            </FormField>
          </div>

          <div className="col-span-12">
            <FormField
              id="descricao"
              label="Descrição"
              error={fieldError("descricao")}>
              <Textarea
                id="descricao"
                aria-required="false"
                aria-invalid={Boolean(errors.descricao)}
                aria-describedby={describedBy("descricao")}
                placeholder="Descreva sobre a unidade"
                maxLength={500}
                {...register("descricao")}
              />
              <div className="mt-1 text-right text-xs text-slate-400">
                {(watch("descricao") ?? "").length}/500
              </div>
            </FormField>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:col-start-1 lg:row-start-2 lg:flex-row">
          <Button
            type="button"
            variant="danger"
            disabled={busy}
            onClick={onCancel}
            leadingIcon={
              <span aria-hidden="true" className="text-base leading-none">
                −
              </span>
            }
            className="w-full rounded-xl lg:w-auto">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="success"
            disabled={busy}
            isLoading={busy}
            leadingIcon={
              <span aria-hidden="true" className="text-base leading-none">
                +
              </span>
            }
            className="w-full rounded-xl lg:w-auto">
            {mode === "criar" ? "Cadastrar unidade" : "Salvar alterações"}
          </Button>
        </div>
      </form>
    );
  },
);
EOF_FROTASYNC

mkdir -p 'components/unidades'
cat > 'components/unidades/UnidadeHeader.tsx' <<'EOF_FROTASYNC'
import Link from "next/link";

import type { Unidade, UnidadeStatus } from "@/types/dashboard";

type UnidadeHeaderProps = {
  unidade: Unidade;
  canManageStatus: boolean;
  isPending?: boolean;
  onStatusAction: (status: UnidadeStatus) => void;
};

export function UnidadeHeader({
  unidade,
  canManageStatus,
  isPending = false,
  onStatusAction,
}: UnidadeHeaderProps) {
  const isActive = unidade.status === "Ativa";
  const statusClasses = isActive
    ? "border-emerald-300 bg-emerald-50 text-emerald-800 shadow-[0_0_12px_rgba(16,185,129,0.12)]"
    : "border-red-300 bg-red-50 text-red-800 shadow-[0_0_12px_rgba(239,68,68,0.12)]";
  const statusLabel = isActive ? "ATIVA" : "INATIVA";
  const nextStatus = isActive ? "Inativa" : "Ativa";

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="break-words text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-[52px]">
          Unidade {unidade.nome} (ID {unidade.codigo})
        </h1>
        <p className="mt-2 text-base font-bold text-slate-700 sm:text-xl">
          {unidade.endereco.logradouro}, {unidade.endereco.numero} -{" "}
          {unidade.endereco.cidade}/{unidade.endereco.uf}
        </p>
        {canManageStatus ? (
          <Link href={`/unidades/${unidade.id}/editar`} className="mt-3 inline-flex items-center rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
            ✎ Editar unidade
          </Link>
        ) : null}
      </div>

      {canManageStatus ? (
        <button
          type="button"
          aria-label={isActive ? "Desativar unidade" : "Ativar unidade"}
          onClick={() => onStatusAction(nextStatus)}
          disabled={isPending}
          className={`inline-flex h-[45px] w-full shrink-0 items-center justify-center rounded-xl border px-5 text-sm font-bold tracking-wide transition hover:brightness-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-[190px] ${statusClasses}`}>
          {statusLabel}
        </button>
      ) : (
        <span
          className={`inline-flex h-[45px] w-full shrink-0 items-center justify-center rounded-xl border px-5 text-sm font-bold tracking-wide sm:w-[190px] ${statusClasses}`}>
          {statusLabel}
        </span>
      )}
    </header>
  );
}
EOF_FROTASYNC

mkdir -p 'components/unidades'
cat > 'components/unidades/UnidadeInativaDialog.tsx' <<'EOF_FROTASYNC'
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
EOF_FROTASYNC

mkdir -p 'hooks'
cat > 'hooks/useEdicao.ts' <<'EOF_FROTASYNC'
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { atualizarUnidade, obterUnidadeParaEdicao } from "@/services/unidadesService";
import { atualizarDocumento, obterDocumento } from "@/services/documentosService";
import { atualizarTarefa, obterTarefa } from "@/services/tarefasService";
import type { DocumentoFormValues } from "@/schemas/documento";
import type { TarefaFormValues } from "@/schemas/tarefa";
import type { UnidadeFormValues } from "@/schemas/unidade";
import type { DocumentoAnexo } from "@/types/dashboard";

async function invalidateEntity(queryClient: ReturnType<typeof useQueryClient>, kind: "unidade" | "documento" | "tarefa", id: string, unidadeId?: string) {
  const keys = [
    ["dashboard"],
    ["dashboard", "indicators"],
    ["dashboard", "documents"],
    ["dashboard", "tasks"],
    ["unidades"],
  ];
  if (kind === "unidade") {
    keys.push(["unidades", "detalhe", id], ["unidades", "indicadores", id]);
  } else if (unidadeId) {
    keys.push(["unidades", "detalhe", unidadeId], ["unidades", "indicadores", unidadeId]);
  }
  await Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
}

export function useEditarUnidade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; data: UnidadeFormValues }) => atualizarUnidade(input.id, input.data),
    onSuccess: (unidade) => invalidateEntity(queryClient, "unidade", unidade.id),
  });
}

export function useEditarDocumento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; data: DocumentoFormValues; anexo?: DocumentoAnexo }) => atualizarDocumento(input.id, input.data, input.anexo),
    onSuccess: (documento) => invalidateEntity(queryClient, "documento", documento.id, documento.unidadeId),
  });
}

export function useEditarTarefa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; data: TarefaFormValues }) => atualizarTarefa(input.id, input.data),
    onSuccess: (tarefa) => invalidateEntity(queryClient, "tarefa", tarefa.id, tarefa.unidadeId),
  });
}

export function useDocumento(id: string) {
  return useQuery({ queryKey: ["documentos", "detalhe", id], queryFn: () => obterDocumento(id), enabled: Boolean(id), staleTime: 30_000 });
}

export function useTarefa(id: string) {
  return useQuery({ queryKey: ["tarefas", "detalhe", id], queryFn: () => obterTarefa(id), enabled: Boolean(id), staleTime: 30_000 });
}

export function useUnidadeParaEdicao(id: string) {
  return useQuery({ queryKey: ["unidades", "detalhe", id], queryFn: () => obterUnidadeParaEdicao(id), enabled: Boolean(id), staleTime: 30_000 });
}
EOF_FROTASYNC

mkdir -p 'mocks'
cat > 'mocks/dashboard.ts' <<'EOF_FROTASYNC'
import type {
  Documento,
  Tarefa,
  TarefaStatus,
  Unidade,
  UnidadeStatus,
} from "../types/dashboard";

type UnidadeSeed = [
  nome: string,
  status: UnidadeStatus,
  cidade: string,
  logradouro: string,
  numero: string,
  bairro: string,
];

const unitSeeds: UnidadeSeed[] = [
  ["Centro", "Inativa", "Recife", "Av. Conde da Boa Vista", "120", "Boa Vista"],
  [
    "Caruaru",
    "Ativa",
    "Caruaru",
    "Av. Agamenon Magalhães",
    "720",
    "Maurício de Nassau",
  ],
  ["Olinda", "Ativa", "Olinda", "Av. Getúlio Vargas", "640", "Bairro Novo"],
  [
    "Jaboatão",
    "Ativa",
    "Jaboatão dos Guararapes",
    "Av. Barreto de Menezes",
    "315",
    "Prazeres",
  ],
  [
    "Boa Viagem",
    "Ativa",
    "Recife",
    "Av. Domingos Ferreira",
    "1850",
    "Boa Viagem",
  ],
  ["Paulista", "Ativa", "Paulista", "Av. Sen. Salgado Filho", "98", "Centro"],
  [
    "Cabo de Santo Agostinho",
    "Ativa",
    "Cabo de Santo Agostinho",
    "Rod. PE-60",
    "1250",
    "Garapu",
  ],
  [
    "Petrolina",
    "Ativa",
    "Petrolina",
    "Av. Monsenhor Ângelo Sampaio",
    "410",
    "Areia Branca",
  ],
  ["Garanhuns", "Ativa", "Garanhuns", "Av. Rui Barbosa", "155", "Heliópolis"],
  ["Igarassu", "Inativa", "Igarassu", "Rua Barbosa Lima", "82", "Centro"],
  [
    "Arcoverde",
    "Inativa",
    "Arcoverde",
    "Av. Cel. Antônio Japiassu",
    "520",
    "Centro",
  ],
  [
    "Vitória de Santo Antão",
    "Ativa",
    "Vitória de Santo Antão",
    "Av. Mariana Amália",
    "340",
    "Matriz",
  ],
  ["Camaragibe", "Ativa", "Camaragibe", "Av. Belmino Correia", "905", "Timbi"],
  [
    "Serra Talhada",
    "Ativa",
    "Serra Talhada",
    "Av. Miguel Nunes de Souza",
    "270",
    "Nossa Senhora da Penha",
  ],
  ["Gravatá", "Inativa", "Gravatá", "Av. Agamenon Magalhães", "615", "Prado"],
  [
    "Abreu e Lima",
    "Ativa",
    "Abreu e Lima",
    "Av. Duque de Caxias",
    "188",
    "Centro",
  ],
  [
    "São Lourenço da Mata",
    "Ativa",
    "São Lourenço da Mata",
    "Av. Oito de Maio",
    "450",
    "Centro",
  ],
  ["Ipojuca", "Ativa", "Ipojuca", "PE-038", "1110", "Centro"],
  [
    "Bezerros",
    "Inativa",
    "Bezerros",
    "Av. Major Aprígio da Fonseca",
    "380",
    "São Sebastião",
  ],
  [
    "Santa Cruz do Capibaribe",
    "Inativa",
    "Santa Cruz do Capibaribe",
    "Av. 29 de Dezembro",
    "225",
    "Centro",
  ],
  ["Araripina", "Ativa", "Araripina", "Rua Santana", "760", "Centro"],
  ["Ouricuri", "Ativa", "Ouricuri", "Av. Fernando Bezerra", "130", "Centro"],
  [
    "Salgueiro",
    "Ativa",
    "Salgueiro",
    "Av. Agamenon Magalhães",
    "515",
    "Nossa Senhora das Graças",
  ],
  [
    "Pesqueira",
    "Ativa",
    "Pesqueira",
    "Rua Anápio Gomes de Andrade",
    "94",
    "Centro",
  ],
  [
    "Belo Jardim",
    "Inativa",
    "Belo Jardim",
    "Av. Deputado José Mendonça",
    "320",
    "Centro",
  ],
  ["Escada", "Ativa", "Escada", "Rua João Manoel Pontual", "180", "Centro"],
  ["Goiana", "Ativa", "Goiana", "Av. Nunes Machado", "845", "Centro"],
  [
    "Palmares",
    "Ativa",
    "Palmares",
    "Av. Visconde do Rio Branco",
    "402",
    "Centro",
  ],
  ["Limoeiro", "Inativa", "Limoeiro", "Rua da Matriz", "73", "Centro"],
  ["Timbaúba", "Ativa", "Timbaúba", "Av. Ferreira Lima", "291", "Centro"],
  ["Surubim", "Ativa", "Surubim", "Rua João Batista", "640", "São José"],
  [
    "Afogados da Ingazeira",
    "Ativa",
    "Afogados da Ingazeira",
    "Av. Manoel Borba",
    "210",
    "Centro",
  ],
  ["Buíque", "Ativa", "Buíque", "Rua Cel. José de Souza", "101", "Centro"],
  [
    "São Bento do Una",
    "Inativa",
    "São Bento do Una",
    "Av. Manoel Cândido",
    "370",
    "Centro",
  ],
  [
    "Lagoa Grande",
    "Ativa",
    "Lagoa Grande",
    "Av. Miguel Arraes",
    "88",
    "Centro",
  ],
];

const units: Unidade[] = unitSeeds.map(
  ([nome, status, cidade, logradouro, numero, bairro], index) => ({
    id: `u-${String(index + 1).padStart(3, "0")}`,
    codigo: String(index + 1).padStart(3, "0"),
    nome,
    status,
    endereco: { logradouro, numero, bairro, cidade, uf: "PE" },
    criadoEm: new Date(
      Date.UTC(2023 + Math.floor(index / 12), index % 12, 5),
    ).toISOString(),
    atualizadoEm: new Date(
      Date.UTC(2024 + Math.floor(index / 18), (index + 1) % 12, 12),
    ).toISOString(),
  }),
);

const docSeeds = [
  ["Alvará de funcionamento", "Legal", 140],
  ["Licença Ambiental", "Ambiental", 8],
  ["Certificado de Bombeiros", "Segurança", -12],
  ["Certidão Negativa de Débitos", "Fiscal", 230],
  ["Contrato de Locação", "Contratual", 85],
  ["Laudo Técnico (Elétrica)", "Técnica", 320],
  ["AVCB - Auto de Vistoria", "Segurança", 190],
  ["Licença Sanitária", "Sanitária", 14],
  ["Registro no Conselho", "Técnica", 410],
  ["Seguro Patrimonial", "Contratual", 175],
  ["Registro na ANTT", "Fiscal", 5],
  ["Seguro de Carga", "Contratual", -35],
  ["Certificado de Dedetização", "Sanitária", 11],
  ["Licença de Operação", "Ambiental", 95],
  ["Alvará do Pátio", "Legal", -2],
  ["Certificado de Manutenção", "Técnica", 60],
] as const;

const taskSeeds = [
  ["Renovar alvará de funcionamento", "Concluída"],
  ["Enviar relatório mensal", "Em andamento"],
  ["Repor extintores", "Pendente"],
  ["Revisar licença ambiental", "Concluída"],
  ["Atualizar cadastro da unidade", "Em andamento"],
  ["Agendar vistoria técnica", "Pendente"],
  ["Conferir seguro patrimonial", "Concluída"],
  ["Regularizar documentação fiscal", "Pendente"],
  ["Validar certificado de bombeiros", "Em andamento"],
  ["Concluir checklist operacional", "Concluída"],
  ["Solicitar renovação da licença", "Pendente"],
  ["Enviar comprovantes de manutenção", "Em andamento"],
  ["Revisar contratos vigentes", "Concluída"],
  ["Organizar documentos da filial", "Pendente"],
  ["Atualizar laudo elétrico", "Concluída"],
  ["Preparar auditoria trimestral", "Em andamento"],
] as const;

function dateOffset(days: number): string {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export const mockUnidades = units;
export const mockCategorias = [
  ...new Set(docSeeds.map(([, categoria]) => categoria)),
];

export const mockDocumentos: Documento[] = Array.from(
  { length: 128 },
  (_, index) => {
    const [nome, categoria] = docSeeds[index % docSeeds.length];
    const unidadeIndex = index % units.length;
    const unitDocumentIndex = Math.floor(index / units.length);
    const statusIndex = (unidadeIndex + unitDocumentIndex) % 3;
    const validityOffset =
      statusIndex === 0
        ? 45 + (unidadeIndex % 30)
        : statusIndex === 1
          ? 1 + (unidadeIndex % 14)
          : -(1 + (unidadeIndex % 35));

    return {
      id: `doc-${String(index + 1).padStart(3, "0")}`,
      nome,
      categoria,
      unidadeId: units[unidadeIndex].id,
      dataEmissao: dateOffset(-365 - (index % 90)),
      dataValidade: dateOffset(validityOffset),
      descricao: `Documento ${nome.toLocaleLowerCase("pt-BR")} da unidade ${units[unidadeIndex].nome}.`,
      anexo: { nome: `${nome}.pdf`, tamanhoBytes: 420_000 + (index % 9) * 73_000, tipo: "application/pdf" },
    };
  },
);

const taskStatuses: TarefaStatus[] = ["Concluída", "Em andamento", "Pendente"];

export const mockTarefas: Tarefa[] = Array.from({ length: 128 }, (_, index) => {
  const [titulo] = taskSeeds[index % taskSeeds.length];
  const unidadeIndex = index % units.length;
  const unitTaskIndex = Math.floor(index / units.length);
  const status =
    taskStatuses[(unidadeIndex + unitTaskIndex) % taskStatuses.length];
  const startOffset = -((index % 70) + 1);
  const completed = status === "Concluída";

  return {
    id: `task-${String(index + 1).padStart(3, "0")}`,
    titulo,
    unidadeId: units[unidadeIndex].id,
    dataInicio: dateOffset(startOffset),
    prazoFinal: dateOffset(startOffset + (index % 24) + 3),
    status,
    dataConclusao: completed ? dateOffset(Math.min(startOffset + 2, -1)) : null,
    descricao: `Detalhes da tarefa: ${titulo.toLocaleLowerCase("pt-BR")}.`,
  };
});
EOF_FROTASYNC

mkdir -p 'schemas'
cat > 'schemas/documento.ts' <<'EOF_FROTASYNC'
import { z } from "zod";

export const documentoSchema = z
  .object({
    nome: z.string().trim().min(2, "Informe o nome do documento.").max(150, "O nome do documento deve ter até 150 caracteres."),
    categoria: z.string().trim().min(1, "Selecione a categoria."),
    dataEmissao: z.string().min(1, "Informe a data de emissão."),
    dataValidade: z.string().min(1, "Informe a data de vencimento."),
    descricao: z.string().trim().max(500, "A descrição deve ter até 500 caracteres.").optional(),
    anexo: z.custom<File>((value) => typeof File !== "undefined" && value instanceof File, "Selecione um arquivo válido.").optional(),
  })
  .superRefine((value, ctx) => {
    if (value.dataEmissao && value.dataValidade && value.dataEmissao > value.dataValidade) {
      ctx.addIssue({ code: "custom", path: ["dataEmissao"], message: "A emissão não pode ser posterior ao vencimento." });
    }
    if (value.anexo) {
      const allowed = ["application/pdf", "image/jpeg", "image/png"];
      const max = 10 * 1024 * 1024;
      if (!allowed.includes(value.anexo.type)) {
        ctx.addIssue({ code: "custom", path: ["anexo"], message: "Envie um PDF, JPG ou PNG." });
      }
      if (value.anexo.size > max) {
        ctx.addIssue({ code: "custom", path: ["anexo"], message: "O arquivo deve ter no máximo 10 MB." });
      }
    }
  });

export type DocumentoFormInput = z.input<typeof documentoSchema>;
export type DocumentoFormValues = z.output<typeof documentoSchema>;
EOF_FROTASYNC

mkdir -p 'schemas'
cat > 'schemas/tarefa.test.ts' <<'EOF_FROTASYNC'
import { describe, expect, it } from "vitest";
import { prazoAlteradoValido } from "./tarefa";

describe("prazo de tarefa", () => {
  it("aceita tarefa atrasada quando o prazo não foi alterado", () => {
    expect(prazoAlteradoValido("2020-01-01", "2020-01-01", new Date("2026-10-06T00:00:00Z"))).toBe(true);
  });

  it("recusa alteração para o passado", () => {
    expect(prazoAlteradoValido("2020-01-01", "2020-01-02", new Date("2026-10-06T00:00:00Z"))).toBe(false);
  });
});
EOF_FROTASYNC

mkdir -p 'schemas'
cat > 'schemas/tarefa.ts' <<'EOF_FROTASYNC'
import { z } from "zod";

export const tarefaSchema = z.object({
  titulo: z.string().trim().min(2, "Informe o título da tarefa.").max(150, "O título deve ter até 150 caracteres."),
  prazoFinal: z.string().min(1, "Informe o prazo final."),
  descricao: z.string().trim().max(500, "A descrição deve ter até 500 caracteres.").optional(),
});

export type TarefaFormInput = z.input<typeof tarefaSchema>;
export type TarefaFormValues = z.output<typeof tarefaSchema>;

export function prazoAlteradoValido(prazoFinal: string, prazoOriginal?: string, hoje = new Date()) {
  if (prazoOriginal && prazoFinal === prazoOriginal) return true;
  const today = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate()));
  const selected = new Date(`${prazoFinal}T00:00:00.000Z`);
  return !Number.isNaN(selected.getTime()) && selected >= today;
}
EOF_FROTASYNC

mkdir -p 'services'
cat > 'services/documentosService.ts' <<'EOF_FROTASYNC'
import { calcularStatusDocumento } from "@/lib/status";
import { mockDocumentos, mockUnidades } from "@/mocks/dashboard";
import type { Documento, DocumentoAnexo } from "@/types/dashboard";
import { UnidadeInativaError, RecursoNaoEncontradoError } from "@/services/dashboardService";
import type { DocumentoFormValues } from "@/schemas/documento";

const wait = (ms = 140) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function obterDocumento(id: string): Promise<Documento | null> {
  await wait(120);
  return mockDocumentos.find((item) => item.id === id) ?? null;
}

export async function atualizarDocumento(id: string, data: DocumentoFormValues, anexo?: DocumentoAnexo): Promise<Documento> {
  await wait();
  const index = mockDocumentos.findIndex((item) => item.id === id);
  if (index < 0) throw new RecursoNaoEncontradoError("Documento");
  const current = mockDocumentos[index];
  const unidade = mockUnidades.find((item) => item.id === current.unidadeId);
  if (!unidade) throw new RecursoNaoEncontradoError("Unidade");
  if (unidade.status === "Inativa") throw new UnidadeInativaError();

  const updated: Documento = {
    ...current,
    nome: data.nome.trim(),
    categoria: data.categoria.trim(),
    dataEmissao: data.dataEmissao,
    dataValidade: data.dataValidade,
    descricao: data.descricao?.trim() || undefined,
    anexo: anexo ?? current.anexo,
  };
  mockDocumentos[index] = updated;
  void calcularStatusDocumento(updated.dataValidade);
  return updated;
}
EOF_FROTASYNC

mkdir -p 'services'
cat > 'services/edicaoService.test.ts' <<'EOF_FROTASYNC'
import { describe, expect, it } from "vitest";

import { atualizarUnidade } from "./unidadesService";
import { atualizarDocumento } from "./documentosService";
import { atualizarTarefa } from "./tarefasService";
import { mockDocumentos, mockTarefas, mockUnidades } from "../mocks/dashboard";
import { UnidadeInativaError } from "./dashboardService";

const unidadeValues = (unidade: (typeof mockUnidades)[number]) => ({
  nome: unidade.nome,
  identificador: unidade.codigo,
  cep: unidade.endereco.cep ?? "50000000",
  logradouro: unidade.endereco.logradouro,
  numero: unidade.endereco.numero,
  complemento: unidade.endereco.complemento ?? "",
  bairro: unidade.endereco.bairro,
  cidade: unidade.endereco.cidade,
  uf: unidade.endereco.uf,
  descricao: unidade.descricao ?? "",
});

describe("edição", () => {
  it("atualiza unidade ignorando seu próprio identificador e preserva status", async () => {
    const original = mockUnidades[1];
    const before = original.atualizadoEm;
    const updated = await atualizarUnidade(original.id, { ...unidadeValues(original), nome: "Caruaru Atualizada" });
    expect(updated.status).toBe(original.status);
    expect(updated.nome).toBe("Caruaru Atualizada");
    expect(updated.atualizadoEm).not.toBe(before);
  });

  it("recusa identificador duplicado de outra unidade", async () => {
    const original = mockUnidades[1];
    await expect(atualizarUnidade(original.id, { ...unidadeValues(original), identificador: mockUnidades[2].codigo })).rejects.toThrow("Já existe uma unidade");
  });

  it("recusa documento de unidade inativa e mantém anexo sem novo arquivo", async () => {
    const document = mockDocumentos.find((item) => mockUnidades.find((unit) => unit.id === item.unidadeId)?.status === "Inativa")!;
    const originalAttachment = document.anexo;
    await expect(atualizarDocumento(document.id, {
      nome: document.nome,
      categoria: document.categoria,
      dataEmissao: document.dataEmissao ?? "2025-01-01",
      dataValidade: document.dataValidade,
      descricao: document.descricao ?? "",
    })).rejects.toBeInstanceOf(UnidadeInativaError);
    expect(document.anexo).toEqual(originalAttachment);
  });

  it("mantém status, início e conclusão ao atualizar tarefa", async () => {
    const task = mockTarefas.find((item) => mockUnidades.find((unit) => unit.id === item.unidadeId)?.status === "Ativa")!;
    const original = { status: task.status, dataInicio: task.dataInicio, dataConclusao: task.dataConclusao };
    const updated = await atualizarTarefa(task.id, { titulo: `${task.titulo} atualizada`, prazoFinal: task.prazoFinal, descricao: task.descricao ?? "" });
    expect(updated.status).toBe(original.status);
    expect(updated.dataInicio).toBe(original.dataInicio);
    expect(updated.dataConclusao).toBe(original.dataConclusao);
  });
});
EOF_FROTASYNC

mkdir -p 'services'
cat > 'services/tarefasService.ts' <<'EOF_FROTASYNC'
import { mockTarefas, mockUnidades } from "@/mocks/dashboard";
import { RecursoNaoEncontradoError, UnidadeInativaError } from "@/services/dashboardService";
import type { Tarefa } from "@/types/dashboard";
import type { TarefaFormValues } from "@/schemas/tarefa";

const wait = (ms = 140) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function obterTarefa(id: string): Promise<Tarefa | null> {
  await wait(120);
  return mockTarefas.find((item) => item.id === id) ?? null;
}

export async function atualizarTarefa(id: string, data: TarefaFormValues): Promise<Tarefa> {
  await wait();
  const index = mockTarefas.findIndex((item) => item.id === id);
  if (index < 0) throw new RecursoNaoEncontradoError("Tarefa");
  const current = mockTarefas[index];
  const unidade = mockUnidades.find((item) => item.id === current.unidadeId);
  if (!unidade) throw new RecursoNaoEncontradoError("Unidade");
  if (unidade.status === "Inativa") throw new UnidadeInativaError();

  const updated: Tarefa = {
    ...current,
    titulo: data.titulo.trim(),
    prazoFinal: data.prazoFinal,
    descricao: data.descricao?.trim() || undefined,
    status: current.status,
    dataInicio: current.dataInicio,
    dataConclusao: current.dataConclusao,
  };
  mockTarefas[index] = updated;
  return updated;
}
EOF_FROTASYNC

mkdir -p 'services'
cat > 'services/unidadesService.ts' <<'EOF_FROTASYNC'
import { mockDocumentos, mockTarefas, mockUnidades } from "../mocks/dashboard";
import { normalizarCep } from "../lib/cep";
import type { UnidadeFormValues } from "../schemas/unidade";
import type {
  Paginated,
  Unidade,
  UnidadeListItem,
  UnidadesFilters,
} from "../types/dashboard";

const DEFAULT_PAGE_SIZE = 12;
const SIMULATED_LATENCY_MS = 120;

export class IdentificadorUnidadeDuplicadoError extends Error {
  constructor() {
    super("Já existe uma unidade com este identificador");
    this.name = "IdentificadorUnidadeDuplicadoError";
  }
}

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

export async function listarUnidades({
  page = 1,
  size = DEFAULT_PAGE_SIZE,
  q = "",
  status = "Todos",
}: UnidadesFilters = {}): Promise<Paginated<UnidadeListItem>> {
  await new Promise<void>((resolve) =>
    setTimeout(resolve, SIMULATED_LATENCY_MS),
  );

  const query = normalizeSearch(q);
  const filtered = mockUnidades
    .filter((unidade) => {
      const matchesQuery =
        !query ||
        normalizeSearch(unidade.nome).includes(query) ||
        normalizeSearch(unidade.codigo).includes(query);
      const matchesStatus = status === "Todos" || unidade.status === status;
      return matchesQuery && matchesStatus;
    })
    .map((unidade) => ({
      ...unidade,
      totalDocumentos: mockDocumentos.filter(
        (documento) => documento.unidadeId === unidade.id,
      ).length,
      totalTarefas: mockTarefas.filter(
        (tarefa) => tarefa.unidadeId === unidade.id,
      ).length,
    }));

  const safeSize = Math.max(1, Math.floor(size));
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / safeSize));
  const safePage = Math.min(Math.max(1, Math.floor(page)), totalPages);
  const start = (safePage - 1) * safeSize;

  return {
    items: filtered.slice(start, start + safeSize),
    page: safePage,
    pageSize: safeSize,
    total,
    totalPages,
  };
}

export async function criarUnidade(data: UnidadeFormValues): Promise<Unidade> {
  await new Promise<void>((resolve) =>
    setTimeout(resolve, SIMULATED_LATENCY_MS),
  );

  const identificador = data.identificador.trim();
  const duplicate = mockUnidades.some(
    (unidade) =>
      normalizeSearch(unidade.codigo) === normalizeSearch(identificador),
  );
  if (duplicate) throw new IdentificadorUnidadeDuplicadoError();

  const nextSequence =
    mockUnidades.reduce((maximum, unidade) => {
      const matched = /^u-(\d+)$/.exec(unidade.id);
      return Math.max(maximum, matched ? Number(matched[1]) : 0);
    }, 0) + 1;
  const timestamp = new Date().toISOString();

  const unidade: Unidade = {
    id: `u-${String(nextSequence).padStart(3, "0")}`,
    nome: data.nome.trim(),
    codigo: identificador,
    status: "Ativa",
    endereco: {
      logradouro: data.logradouro.trim(),
      numero: data.numero.trim(),
      bairro: data.bairro.trim(),
      cidade: data.cidade.trim(),
      uf: data.uf,
      cep: normalizarCep(data.cep),
      complemento: data.complemento?.trim() || undefined,
    },
    descricao: data.descricao?.trim() || undefined,
    criadoEm: timestamp,
    atualizadoEm: timestamp,
  };

  mockUnidades.push(unidade);
  return unidade;
}

export async function obterUnidadeParaEdicao(id: string): Promise<Unidade | null> {
  await new Promise<void>((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
  return mockUnidades.find((unidade) => unidade.id === id) ?? null;
}

export async function atualizarUnidade(id: string, data: UnidadeFormValues): Promise<Unidade> {
  await new Promise<void>((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));
  const index = mockUnidades.findIndex((unidade) => unidade.id === id);
  if (index < 0) throw new Error("Unidade não encontrada.");
  const identificador = data.identificador.trim();
  const duplicate = mockUnidades.some(
    (unidade) => unidade.id !== id && normalizeSearch(unidade.codigo) === normalizeSearch(identificador),
  );
  if (duplicate) throw new IdentificadorUnidadeDuplicadoError();

  const current = mockUnidades[index];
  const updated: Unidade = {
    ...current,
    nome: data.nome.trim(),
    codigo: identificador,
    endereco: {
      logradouro: data.logradouro.trim(),
      numero: data.numero.trim(),
      complemento: data.complemento?.trim() || undefined,
      bairro: data.bairro.trim(),
      cidade: data.cidade.trim(),
      uf: data.uf,
      cep: normalizarCep(data.cep),
    },
    descricao: data.descricao?.trim() || undefined,
    atualizadoEm: new Date().toISOString(),
  };
  mockUnidades[index] = updated;
  return updated;
}
EOF_FROTASYNC

mkdir -p 'types'
cat > 'types/dashboard.ts' <<'EOF_FROTASYNC'
export type UnidadeStatus = "Ativa" | "Inativa";
export type PerfilUsuario = "Administrador" | "Gestor" | "Colaborador";
export type DocumentoStatus = "Válido" | "Próximo do vencimento" | "Expirado";
export type TarefaStatus = "Pendente" | "Em andamento" | "Concluída";

export const UF_SIGLAS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

export type Uf = (typeof UF_SIGLAS)[number];

export type Unidade = {
  id: string;
  nome: string;
  codigo: string;
  status: UnidadeStatus;
  endereco: EnderecoUnidade;
  descricao?: string;
  criadoEm?: string;
  atualizadoEm?: string;
};

export type UsuarioSessao = { nome: string; perfil: PerfilUsuario };

export type EnderecoUnidade = {
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: Uf;
  cep?: string;
  complemento?: string;
};

export type EnderecoCep = Pick<EnderecoUnidade, "logradouro" | "bairro" | "cidade" | "uf">;
export type UnidadeListItem = Unidade & { totalDocumentos: number; totalTarefas: number };
export type UnidadesFilters = { page?: number; size?: number; q?: string; status?: UnidadeStatus | "Todos" };

export type DocumentoAnexo = { nome: string; tamanhoBytes: number; tipo?: string };
export type Documento = {
  id: string;
  nome: string;
  unidadeId: string;
  categoria: string;
  dataEmissao: string | null;
  dataValidade: string;
  descricao?: string;
  anexo?: DocumentoAnexo;
};

export type Tarefa = {
  id: string;
  titulo: string;
  unidadeId: string;
  dataInicio: string;
  prazoFinal: string;
  status: TarefaStatus;
  dataConclusao: string | null;
  descricao?: string;
};

export type DashboardDistribution = { label: string; value: number; color: string };
export type DashboardIndicators = {
  unidades: DashboardDistribution[];
  documentos: DashboardDistribution[];
  tarefas: DashboardDistribution[];
  totalPendencias: number;
  documentosAVencer: number;
  tarefasConcluidas: number;
  variacaoDocumentosAVencer: number | null;
  variacaoTarefasConcluidas: number | null;
};
export type UnidadeIndicadores = {
  documentos: DashboardDistribution[];
  tarefas: DashboardDistribution[];
  documentosExpirados: number;
  tarefasConcluidas: number;
  variacaoDocumentosExpirados: number | null;
  variacaoTarefasConcluidas: number | null;
};
export type Paginated<T> = { items: T[]; page: number; pageSize: number; total: number; totalPages: number };
export type DocumentFilters = { page: number; pageSize: number; search: string; unidadeId: string; categoria: string; status: DocumentoStatus | "Todos" };
export type TaskFilters = { page: number; pageSize: number; search: string; unidadeId: string; status: TarefaStatus | "Todos" };
EOF_FROTASYNC

