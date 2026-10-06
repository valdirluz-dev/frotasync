import { Icon } from "@/components/dashboard/Icons";

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  entity,
  onChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  entity: "documentos" | "tarefas" | "unidades";
  onChange: (nextPage: number) => void;
}) {
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  const pages =
    totalPages <= 7
      ? Array.from({ length: totalPages }, (_, index) => index + 1)
      : page <= 3
        ? [1, 2, 3, 4, 5, totalPages]
        : page >= totalPages - 2
          ? [
              1,
              totalPages - 4,
              totalPages - 3,
              totalPages - 2,
              totalPages - 1,
              totalPages,
            ]
          : [1, page - 1, page, page + 1, totalPages];

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <span>
        Mostrando{" "}
        <strong className="font-semibold text-slate-700">{first}</strong> a{" "}
        <strong className="font-semibold text-slate-700">{last}</strong> de{" "}
        <strong className="font-semibold text-slate-700">{total}</strong>{" "}
        {entity}
      </span>
      <nav aria-label="Paginação" className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Página anterior"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40">
          <Icon name="left" className="h-3.5 w-3.5" />
        </button>
        {pages.map((pageNumber, index) => (
          <span key={`${pageNumber}-${index}`} className="flex items-center">
            {index > 0 && pageNumber - pages[index - 1] > 1 ? (
              <span className="px-1">…</span>
            ) : null}
            <button
              type="button"
              aria-current={pageNumber === page ? "page" : undefined}
              onClick={() => onChange(pageNumber)}
              className={`h-8 min-w-8 rounded-lg px-2 text-xs ${pageNumber === page ? "bg-indigo-600 font-semibold text-white" : "text-slate-600 hover:bg-slate-100"}`}>
              {pageNumber}
            </button>
          </span>
        ))}
        <button
          type="button"
          aria-label="Próxima página"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40">
          <Icon name="right" className="h-3.5 w-3.5" />
        </button>
      </nav>
    </div>
  );
}
