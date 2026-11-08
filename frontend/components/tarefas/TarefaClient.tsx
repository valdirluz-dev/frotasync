"use client";

import { useMemo, useState } from "react";
// Componentes de Layout e Interface
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Icon } from "@/components/ui/Icons";
import { StatTrend } from "@/components/dashboard/StatTrend";
import { TarefasTable } from "@/components/tarefas/TarefasTable";

// Hooks customizados do dashboard e tarefas
import { useDashboardTasks, useDashboardIndicators } from "@/hooks/useDashboard";

// Mocks (dados estáticos) de unidades
import { mockUnidades } from "@/mocks/dashboard";
import type { TarefaStatus } from "@/types/domain";

// Opções de status disponíveis para filtragem na tabela de tarefas
const tarefaStatuses: Array<TarefaStatus | "Todos"> = [
  "Todos",
  "Pendente",
  "Em andamento",
  "Concluída",
];

/**
 * Componente cliente responsável por gerir o estado global,
 * os filtros e a listagem da página principal de Tarefas.
 */
export function TarefasClient() {
  // --- ESTADOS LOCAIS DOS FILTROS E PAGINAÇÃO ---
  const [unitId, setUnitId] = useState("todas");
  const [tarefaSearch, setTarefaSearch] = useState("");
  const [tarefaStatus, setTarefaStatus] = useState<TarefaStatus | "Todos">("Todos");
  const [tarefaPage, setTarefaPage] = useState(1);

  // --- CONSULTAS DE DADOS (HOOKS SWR/REACT QUERY) ---
  const indicatorQuery = useDashboardIndicators();
  const indicators = indicatorQuery.data;

  const tarefaQuery = useDashboardTasks({
    page: tarefaPage,
    pageSize: 10,
    search: tarefaSearch,
    unidadeId: unitId,
    status: tarefaStatus,
  });

  // Mapeamentos otimizados de nomes e status de unidades para passagem direta à tabela
  const unitNames = useMemo(
    () => new Map(mockUnidades.map((unit) => [unit.id, unit.nome])),
    []
  );
  const unitStatuses = useMemo(
    () => new Map(mockUnidades.map((unit) => [unit.id, unit.status])),
    []
  );

  return (
    // Mantém a aba 'tarefas' ativa no menu lateral
    <AppShell activeTab="tarefas">
      
      {/* 1. CABEÇALHO DA PÁGINA */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-[32px] font-bold leading-tight tracking-[-0.04em] text-slate-900 sm:text-[40px]">
          Tarefas
        </h1>
      </div>

      <section aria-label="Lista de tarefas">
        
        {/* 2. BLOCO DE DESTAQUE E BOTÃO DE AÇÃO (Usando os indicadores oficiais do dashboard) */}
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center">
          <div className="min-w-0 flex-1">
            <StatTrend
              label="Total de Tarefas Concluídas"
              value={indicators?.tarefasConcluidas}
              variation={indicators?.variacaoTarefasConcluidas}
            />
          </div>

          <Link href="/tarefas/nova" className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700">
            <Icon name="plus" className="h-4 w-4" />
            Nova tarefa
          </Link>
        </div>

        {/* 3. BARRA DE FILTROS E PESQUISA */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          
          {/* Pesquisa por Título */}
          <label className="block min-w-0">
            <span className="mb-1.5 block text-[10px] font-bold text-slate-700">Buscar tarefa</span>
            <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
              <Icon name="search" className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={tarefaSearch}
                onChange={(event) => {
                  setTarefaSearch(event.target.value);
                  setTarefaPage(1);
                }}
                placeholder="Digite o título da tarefa..."
                className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400"
              />
            </div>
          </label>

          {/* Filtro por Unidade */}
          <label className="block min-w-0">
            <span className="mb-1.5 block text-[10px] font-bold text-slate-700">Unidade</span>
            <select
              value={unitId}
              onChange={(event) => {
                setUnitId(event.target.value);
                setTarefaPage(1);
              }}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="todas">Todas as unidades</option>
              {mockUnidades.map((unit) => (
                <option key={unit.id} value={unit.id}>{unit.nome}</option>
              ))}
            </select>
          </label>

          {/* Filtro por Status */}
          <label className="block min-w-0">
            <span className="mb-1.5 block text-[10px] font-bold text-slate-700">Status</span>
            <select
              value={tarefaStatus}
              onChange={(event) => {
                setTarefaStatus(event.target.value as TarefaStatus | "Todos");
                setTarefaPage(1);
              }}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="Todos">Todos os status</option>
              {tarefaStatuses
                .filter((status) => status !== "Todos")
                .map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
            </select>
          </label>
        </div>

        {/* 4. TABELA PRINCIPAL DE TAREFAS */}
        <div className="mt-7">
          <TarefasTable
            items={tarefaQuery.data?.items ?? []}
            mode="global"
            unidadeNames={unitNames}
            unidadeStatuses={unitStatuses}
            isLoading={tarefaQuery.isPending}
            isError={tarefaQuery.isError}
            onRetry={() => void tarefaQuery.refetch()}
            page={tarefaQuery.data?.page ?? tarefaPage}
            totalPages={tarefaQuery.data?.totalPages ?? 1}
            total={tarefaQuery.data?.total ?? 0}
            pageSize={tarefaQuery.data?.pageSize ?? 10}
            onPageChange={setTarefaPage}
          />
        </div>

      </section>
    </AppShell>
  );
}