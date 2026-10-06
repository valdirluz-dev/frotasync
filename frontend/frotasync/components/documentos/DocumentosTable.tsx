"use client";

import { getCoreRowModel, useLegacyTable } from "@tanstack/react-table/legacy";

import { Icon } from "@/components/dashboard/Icons";
import { Pagination } from "@/components/dashboard/Pagination";
import { EmptyState, ErrorState, LoadingState } from "@/components/dashboard/StateViews";
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
              {table.getRowModel().rows.map(({ original: document }) => (
                <tr key={document.id} className="hover:bg-slate-50/80">
                  <td className="whitespace-nowrap px-3 py-3 text-xs font-semibold text-slate-900 first:pl-4">
                    {document.nome}
                  </td>
                  {showUnit ? (
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-700">
                      {unidadeNames?.get(document.unidadeId) ?? "—"}
                    </td>
                  ) : null}
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-700">
                    {document.categoria}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs tabular-nums text-slate-700">
                    {formatDate(document.dataEmissao)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs tabular-nums text-slate-700">
                    {formatDate(document.dataValidade)}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge
                      status={calcularStatusDocumento(document.dataValidade)}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      disabled
                      title={isReadOnly ? "Unidade inativa" : "Em breve"}
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-medium disabled:cursor-not-allowed ${isReadOnly ? "border-slate-200 bg-slate-100 text-slate-400" : "border-slate-200 text-slate-500"}`}>
                      <Icon name="edit" className="h-3 w-3" />
                      {mode === "unidade" ? "Editar informações" : "Editar"}
                    </button>
                  </td>
                </tr>
              ))}
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
