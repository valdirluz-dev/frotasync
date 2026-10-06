"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

import { AppShell } from "@/components/dashboard/AppShell";
import { ErrorState } from "@/components/dashboard/StateViews";
import { Pagination } from "@/components/dashboard/Pagination";
import { UnidadesFilters } from "@/components/unidades/UnidadesFilters";
import { UnidadesGrid } from "@/components/unidades/UnidadesGrid";
import { useUnidades } from "@/hooks/useUnidades";
import { mockUnidades } from "@/mocks/dashboard";
import type { UnidadeStatus } from "@/types/dashboard";

const PAGE_SIZE = 12;
const VALID_STATUSES: UnidadeStatus[] = ["Ativa", "Inativa"];

function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

function parseStatus(value: string | null): UnidadeStatus | "Todos" {
  return value && VALID_STATUSES.includes(value as UnidadeStatus)
    ? (value as UnidadeStatus)
    : "Todos";
}

export function UnidadesClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("q") ?? "";
  const status = parseStatus(searchParams.get("status"));
  const page = parsePage(searchParams.get("page"));
  const unidadesQuery = useUnidades({
    page,
    size: PAGE_SIZE,
    q: queryFromUrl,
    status,
  });
  const items = unidadesQuery.data?.items ?? [];
  const isEmptyCollection = mockUnidades.length === 0;

  const currentFilters = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams],
  );

  const updateUrl = useCallback(
    (updates: {
      q?: string;
      status?: UnidadeStatus | "Todos";
      page?: number;
    }) => {
      const params = new URLSearchParams(currentFilters.toString());
      if (updates.q !== undefined) {
        if (updates.q) params.set("q", updates.q);
        else params.delete("q");
      }
      if (updates.status !== undefined) {
        if (updates.status === "Todos") params.delete("status");
        else params.set("status", updates.status);
      }
      if (updates.page !== undefined && updates.page > 1) {
        params.set("page", String(updates.page));
      } else if (updates.page !== undefined) {
        params.delete("page");
      }
      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [currentFilters, pathname, router],
  );

  const commitSearch = useCallback(
    (query: string) => updateUrl({ q: query, page: 1 }),
    [updateUrl],
  );

  useEffect(() => {
    const resultPage = unidadesQuery.data?.page;
    if (
      resultPage !== undefined &&
      !unidadesQuery.isPlaceholderData &&
      resultPage !== page
    ) {
      updateUrl({ page: resultPage });
    }
    // URL changes only when the service clamps an out-of-range page.
  }, [
    page,
    unidadesQuery.data?.page,
    unidadesQuery.isPlaceholderData,
    updateUrl,
  ]);

  function clearFilters() {
    router.replace(pathname, { scroll: false });
  }

  return (
    <AppShell activeTab="unidades">
      <section className="space-y-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Unidades
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Consulte as filiais e os pátios cadastrados.
          </p>
        </div>

        <UnidadesFilters
          key={queryFromUrl}
          query={queryFromUrl}
          status={status}
          onQueryCommit={commitSearch}
          onStatusChange={(nextStatus) => {
            updateUrl({ status: nextStatus, page: 1 });
          }}
        />

        <button
          type="button"
          disabled
          title="Em breve"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 text-xs font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-90">
          <span
            aria-hidden="true"
            className="text-base font-normal leading-none">
            +
          </span>
          Nova Unidade
        </button>

        {unidadesQuery.isError ? (
          <div className="rounded-2xl border border-slate-200 bg-white">
            <ErrorState
              label="Não foi possível carregar as unidades."
              onRetry={() => void unidadesQuery.refetch()}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <UnidadesGrid
              items={items}
              isLoading={unidadesQuery.isPending}
              isEmptyCollection={isEmptyCollection}
              onClearFilters={clearFilters}
            />
            {unidadesQuery.data ? (
              <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                <Pagination
                  page={unidadesQuery.data.page}
                  totalPages={unidadesQuery.data.totalPages}
                  total={unidadesQuery.data.total}
                  pageSize={unidadesQuery.data.pageSize}
                  entity="unidades"
                  onChange={(nextPage) => updateUrl({ page: nextPage })}
                />
              </div>
            ) : null}
          </div>
        )}
      </section>
    </AppShell>
  );
}
