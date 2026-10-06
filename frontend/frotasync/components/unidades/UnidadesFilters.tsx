"use client";

import { Icon } from "@/components/dashboard/Icons";
import type { UnidadeStatus } from "@/types/dashboard";
import { useEffect, useState } from "react";

export function UnidadesFilters({
  query,
  status,
  onQueryCommit,
  onStatusChange,
}: {
  query: string;
  status: UnidadeStatus | "Todos";
  onQueryCommit: (value: string) => void;
  onStatusChange: (value: UnidadeStatus | "Todos") => void;
}) {
  const [queryDraft, setQueryDraft] = useState(query);

  useEffect(() => {
    if (queryDraft.trim() === query) return;

    const timeout = window.setTimeout(
      () => onQueryCommit(queryDraft.trim()),
      300,
    );
    return () => window.clearTimeout(timeout);
  }, [onQueryCommit, query, queryDraft]);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block min-w-0">
        <span className="mb-1.5 block text-[11px] font-bold text-slate-700">
          Buscar Unidade
        </span>
        <span className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
          <Icon name="search" className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            aria-label="Buscar Unidade"
            value={queryDraft}
            onChange={(event) => setQueryDraft(event.target.value)}
            placeholder="Digite o nome ou identificador da unidade..."
            className="min-w-0 flex-1 bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
          />
        </span>
      </label>

      <label className="block min-w-0">
        <span className="mb-1.5 block text-[11px] font-bold text-slate-700">
          Status
        </span>
        <select
          aria-label="Filtrar por status da unidade"
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as UnidadeStatus | "Todos")
          }
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100">
          <option value="Todos">Todos os status</option>
          <option value="Ativa">Ativa</option>
          <option value="Inativa">Inativa</option>
        </select>
      </label>
    </div>
  );
}
