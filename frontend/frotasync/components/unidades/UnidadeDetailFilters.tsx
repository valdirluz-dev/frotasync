"use client";

import { useEffect, useState } from "react";

import { Icon } from "@/components/dashboard/Icons";
import { mockCategorias } from "@/mocks/dashboard";
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

export function UnidadeDetailFilters({
  tab,
  query,
  category,
  documentStatus,
  taskStatus,
  onQueryCommit,
  onCategoryChange,
  onDocumentStatusChange,
  onTaskStatusChange,
}: {
  tab: "documentos" | "tarefas";
  query: string;
  category: string;
  documentStatus: DocumentoStatus | "Todos";
  taskStatus: TarefaStatus | "Todos";
  onQueryCommit: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onDocumentStatusChange: (status: DocumentoStatus | "Todos") => void;
  onTaskStatusChange: (status: TarefaStatus | "Todos") => void;
}) {
  const [draft, setDraft] = useState(query);

  useEffect(() => {
    if (draft.trim() === query) return;
    const timeout = window.setTimeout(() => onQueryCommit(draft.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [draft, onQueryCommit, query]);

  return (
    <div
      className={`grid gap-3 ${tab === "documentos" ? "sm:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2"}`}>
      <label className="block min-w-0">
        <span className="mb-1.5 block text-[10px] font-bold text-slate-700">
          {tab === "documentos" ? "Buscar documento" : "Buscar Tarefas"}
        </span>
        <span className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
          <Icon name="search" className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            aria-label={
              tab === "documentos" ? "Buscar documento" : "Buscar Tarefas"
            }
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={
              tab === "documentos"
                ? "Digite o nome do documento..."
                : "Digite o nome da tarefa..."
            }
            className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400"
          />
        </span>
      </label>

      {tab === "documentos" ? (
        <>
          <label className="block min-w-0">
            <span className="mb-1.5 block text-[10px] font-bold text-slate-700">
              Categoria
            </span>
            <select
              aria-label="Filtrar por categoria"
              value={category}
              onChange={(event) => onCategoryChange(event.target.value)}
              className={selectClass}>
              <option value="todas">Todas as categorias</option>
              {mockCategorias.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="block min-w-0">
            <span className="mb-1.5 block text-[10px] font-bold text-slate-700">
              Status
            </span>
            <select
              aria-label="Filtrar por status do documento"
              value={documentStatus}
              onChange={(event) =>
                onDocumentStatusChange(
                  event.target.value as DocumentoStatus | "Todos",
                )
              }
              className={selectClass}>
              {documentStatuses.map((value) => (
                <option key={value} value={value}>
                  {value === "Todos" ? "Todos os status" : value}
                </option>
              ))}
            </select>
          </label>
        </>
      ) : (
        <label className="block min-w-0">
          <span className="mb-1.5 block text-[10px] font-bold text-slate-700">
            Status
          </span>
          <select
            aria-label="Filtrar por status da tarefa"
            value={taskStatus}
            onChange={(event) =>
              onTaskStatusChange(event.target.value as TarefaStatus | "Todos")
            }
            className={selectClass}>
            {taskStatuses.map((value) => (
              <option key={value} value={value}>
                {value === "Todos" ? "Todos os status" : value}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}

const selectClass =
  "h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-8 text-xs text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";
