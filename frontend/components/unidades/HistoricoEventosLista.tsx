"use client";

import type { HistoricoUnidadeEvento } from "@/types/domain";

import { EmptyState, ErrorState, LoadingState } from "@/components/ui/StateViews";
import { Pagination } from "@/components/ui/Pagination";

export function HistoricoEventosLista({
  items,
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  isLoading,
  isError,
  onRetry,
  unidadeNames,
}: {
  items: HistoricoUnidadeEvento[];
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  unidadeNames?: ReadonlyMap<string, string>;
}) {
  if (isLoading) return <LoadingState label="Carregando histórico..." />;
  if (isError) {
    return (
      <ErrorState
        label="Não foi possível carregar o histórico."
        onRetry={onRetry}
      />
    );
  }
  if (total === 0) {
    return <EmptyState label="Ainda não há alterações registradas." />;
  }

  return (
    <>
      <ol className="divide-y divide-slate-100">
        {items.map((evento) => (
          <li
            key={evento.id}
            className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-800">
                {evento.acao}:{" "}
                <span className="font-semibold">{evento.entidadeNome}</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {evento.entidade} · {evento.usuario}
                {unidadeNames ? (
                  <>
                    {" · "}Unidade:{" "}
                    {unidadeNames.get(evento.unidadeId) ?? "Unidade removida"}
                  </>
                ) : null}
              </p>
            </div>
            <time
              dateTime={evento.criadoEm}
              className="shrink-0 text-xs text-slate-500">
              {new Intl.DateTimeFormat("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
              }).format(new Date(evento.criadoEm))}
            </time>
          </li>
        ))}
      </ol>
      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        entity="alterações"
        onChange={onPageChange}
      />
    </>
  );
}
