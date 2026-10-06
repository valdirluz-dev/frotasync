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
