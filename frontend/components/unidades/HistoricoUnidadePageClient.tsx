"use client";

import Link from "next/link";

import { AppShell } from "@/components/layout/AppShell";
import { Icon } from "@/components/ui/Icons";
import { HistoricoUnidade } from "@/components/unidades/HistoricoUnidade";
import { useUnidade } from "@/hooks/useUnidadeDetalhe";

export function HistoricoUnidadePageClient({ unidadeId }: { unidadeId: string }) {
  const unidadeQuery = useUnidade(unidadeId);
  const unidade = unidadeQuery.data;
  const title = unidade
    ? `Unidade ${unidade.nome} (ID ${unidade.codigo})`
    : "Histórico de alterações da unidade";

  return (
    <AppShell
      activeTab="unidades"
      breadcrumb={{
        custom: (
          <div className="hidden items-center gap-2 text-xs sm:flex">
            <Link href="/unidades" className="text-slate-500 hover:text-indigo-700">
              Unidades
            </Link>
            <span className="text-slate-300">/</span>
            <Link
              href={`/unidades/${unidadeId}`}
              className="text-slate-500 hover:text-indigo-700">
              {unidade?.nome ?? "Unidade"}
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-800">Histórico</span>
          </div>
        ),
      }}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[28px] font-bold leading-tight tracking-[-0.04em] text-slate-900 sm:text-[36px]">
            {title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Histórico de alterações da unidade, da mais recente para a mais antiga.
          </p>
        </div>
        <Link
          href={`/unidades/${unidadeId}`}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2">
          <Icon name="left" className="h-4 w-4" />
          Voltar à unidade
        </Link>
      </div>

      <HistoricoUnidade unidadeId={unidadeId} />
    </AppShell>
  );
}
