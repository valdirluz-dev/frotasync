"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { listarUnidades } from "@/services/unidadesService";
import type { UnidadesFilters } from "@/types/dashboard";

export function useUnidades(filters: UnidadesFilters) {
  return useQuery({
    queryKey: ["unidades", "lista", filters],
    queryFn: () => listarUnidades(filters),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
