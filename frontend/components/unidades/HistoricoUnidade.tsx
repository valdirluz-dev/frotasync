"use client";

import { useState } from "react";

import { useHistoricoUnidade } from "@/hooks/useHistoricoUnidade";
import { HistoricoEventosLista } from "@/components/unidades/HistoricoEventosLista";

const PAGE_SIZE = 10;

export function HistoricoUnidade({ unidadeId }: { unidadeId: string }) {
  const [page, setPage] = useState(1);
  const historicoQuery = useHistoricoUnidade(unidadeId, page, PAGE_SIZE);
  const historico = historicoQuery.data;

  return (
    <section
      aria-label="Histórico de alterações"
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900">
          Histórico de alterações
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Atividades registradas nesta unidade, da mais recente para a mais antiga.
        </p>
      </header>

      <HistoricoEventosLista
        items={historico?.items ?? []}
        page={historico?.page ?? page}
        totalPages={historico?.totalPages ?? 1}
        total={historico?.total ?? 0}
        pageSize={historico?.pageSize ?? PAGE_SIZE}
        onPageChange={setPage}
        isLoading={historicoQuery.isPending}
        isError={historicoQuery.isError || !historico}
        onRetry={() => void historicoQuery.refetch()}
      />
    </section>
  );
}
