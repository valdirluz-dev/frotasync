"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { listarUnidades } from "@/services/unidadesService";
import { queryKeys } from "@/lib/queryKeys";
import type { UnidadesFilters } from "@/types/domain";

export function useUnidades(filters: UnidadesFilters) {
  return useQuery({
    queryKey: queryKeys.unidades.list(filters),
    queryFn: () => listarUnidades(filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
