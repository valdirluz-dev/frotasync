import { EmptyState } from "@/components/dashboard/StateViews";
import { UnidadeCard } from "@/components/unidades/UnidadeCard";
import type { UnidadeListItem } from "@/types/dashboard";

export function UnidadesGrid({
  items,
  isLoading,
  isEmptyCollection,
  onClearFilters,
}: {
  items: UnidadeListItem[];
  isLoading: boolean;
  isEmptyCollection: boolean;
  onClearFilters: () => void;
}) {
  if (isLoading && items.length === 0) {
    return (
      <div
        role="status"
        aria-label="Carregando unidades"
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
        {Array.from({ length: 12 }, (_, index) => (
          <div
            key={index}
            className="min-h-[250px] animate-pulse rounded-xl border-4 border-slate-200 bg-white p-4">
            <div className="mx-auto h-6 w-3/4 rounded bg-slate-200" />
            <div className="mx-auto mt-4 h-8 w-full rounded bg-slate-100" />
            <div className="mt-6 h-3 w-1/2 rounded bg-slate-100" />
            <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
            <div className="mt-8 h-9 rounded-full bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6 text-center">
        <EmptyState
          label={
            isEmptyCollection
              ? "Nenhuma unidade cadastrada."
              : "Nenhuma unidade encontrada."
          }
        />
        {!isEmptyCollection ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-2 rounded-lg px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
            Limpar filtros
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
      {items.map((unidade) => (
        <UnidadeCard key={unidade.id} unidade={unidade} />
      ))}
    </div>
  );
}
