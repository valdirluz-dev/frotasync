"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { listarCategoriasDocumento } from "@/services/documentosService";
import { listarTodasUnidades } from "@/services/unidadesService";

export function useCatalogoUnidades() {
  return useQuery({
    queryKey: queryKeys.unidades.catalog,
    queryFn: listarTodasUnidades,
    staleTime: 30_000,
  });
}

export function useCategoriasDocumento() {
  return useQuery({
    queryKey: queryKeys.catalogs.documentCategories,
    queryFn: listarCategoriasDocumento,
    staleTime: 60_000,
  });
}
