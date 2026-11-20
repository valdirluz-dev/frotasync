"use client";

import { useMemo, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { Icon } from "@/components/ui/Icons";
import { HistoricoEventosLista } from "@/components/unidades/HistoricoEventosLista";
import { useHistoricoGlobal } from "@/hooks/useHistoricoUnidade";
import { mockUnidades } from "@/mocks/dashboard";
import type { HistoricoUnidadeEvento } from "@/types/domain";

const PAGE_SIZE = 10;

export function HistoricoGlobalClient() {
  const [search, setSearch] = useState("");
  const [unidadeId, setUnidadeId] = useState("todas");
  const [entidade, setEntidade] = useState<
    HistoricoUnidadeEvento["entidade"] | "Todas"
  >("Todas");
  const [page, setPage] = useState(1);
  const historicoQuery = useHistoricoGlobal({
    page,
    pageSize: PAGE_SIZE,
    search,
    unidadeId,
    entidade,
  });
  const unidadeNames = useMemo(
    () => new Map(mockUnidades.map((unidade) => [unidade.id, unidade.nome])),
    [],
  );
  const inputClass =
    "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

  return (
    <AppShell activeTab="historico">
      <div className="mb-6">
        <h1 className="text-[32px] font-bold leading-tight tracking-[-0.04em] text-slate-900 sm:text-[40px]">
          Histórico de alterações
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Consulte as alterações registradas em todas as unidades.
        </p>
      </div>

      <section
        aria-label="Histórico global de alterações"
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-3 border-b border-slate-100 p-5 sm:grid-cols-2 xl:grid-cols-3">
          <label className="block min-w-0">
            <span className="mb-1.5 block text-[10px] font-bold text-slate-700">
              Pesquisar alterações
            </span>
            <span className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
              <Icon name="search" className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                aria-label="Pesquisar alterações"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Ação, usuário, registro ou unidade..."
                className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400"
              />
            </span>
          </label>

          <label className="block min-w-0">
            <span className="mb-1.5 block text-[10px] font-bold text-slate-700">
              Unidade
            </span>
            <select
              aria-label="Filtrar por unidade"
              value={unidadeId}
              onChange={(event) => {
                setUnidadeId(event.target.value);
                setPage(1);
              }}
              className={inputClass}>
              <option value="todas">Todas as unidades</option>
              {mockUnidades.map((unidade) => (
                <option key={unidade.id} value={unidade.id}>
                  {unidade.nome}
                </option>
              ))}
            </select>
          </label>

          <label className="block min-w-0">
            <span className="mb-1.5 block text-[10px] font-bold text-slate-700">
              Tipo de alteração
            </span>
            <select
              aria-label="Filtrar por tipo de alteração"
              value={entidade}
              onChange={(event) => {
                setEntidade(
                  event.target.value as HistoricoUnidadeEvento["entidade"] | "Todas",
                );
                setPage(1);
              }}
              className={inputClass}>
              <option value="Todas">Todos os tipos</option>
              <option value="Unidade">Unidades</option>
              <option value="Documento">Documentos</option>
              <option value="Tarefa">Tarefas</option>
            </select>
          </label>
        </div>

        <HistoricoEventosLista
          items={historicoQuery.data?.items ?? []}
          page={historicoQuery.data?.page ?? page}
          totalPages={historicoQuery.data?.totalPages ?? 1}
          total={historicoQuery.data?.total ?? 0}
          pageSize={historicoQuery.data?.pageSize ?? PAGE_SIZE}
          onPageChange={setPage}
          isLoading={historicoQuery.isPending}
          isError={historicoQuery.isError}
          onRetry={() => void historicoQuery.refetch()}
          unidadeNames={unidadeNames}
        />
      </section>
    </AppShell>
  );
}
