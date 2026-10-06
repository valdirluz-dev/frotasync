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
