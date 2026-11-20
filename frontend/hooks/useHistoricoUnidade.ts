"use client";

import { useQuery } from "@tanstack/react-query";

import {
  listarHistoricoGlobal,
  listarHistoricoUnidade,
} from "@/services/historicoUnidadesService";
import type { HistoricoFilters } from "@/types/domain";

export function useHistoricoUnidade(
  unidadeId: string,
  page: number,
  pageSize = 10,
) {
  return useQuery({
    queryKey: ["unidades", "historico", unidadeId, page, pageSize],
    queryFn: () => listarHistoricoUnidade(unidadeId, page, pageSize),
    enabled: unidadeId.length > 0,
    staleTime: 30_000,
  });
}

export function useHistoricoGlobal(filters: HistoricoFilters) {
  return useQuery({
    queryKey: ["historico-alteracoes", filters],
    queryFn: () => listarHistoricoGlobal(filters),
    staleTime: 30_000,
  });
}
