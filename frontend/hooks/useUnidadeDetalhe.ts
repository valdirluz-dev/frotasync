"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  alterarStatusUnidade,
  obterIndicadoresUnidade,
  obterUnidade,
} from "@/services/unidadesService";
import { alterarStatusTarefa } from "@/services/tarefasService";
import { useSessao } from "@/hooks/useSessao";
import { invalidateEntityData } from "@/hooks/invalidateEntityData";
import { queryKeys } from "@/lib/queryKeys";
import type { TarefaStatus, UnidadeStatus } from "@/types/domain";

export function useUnidade(id: string) {
  return useQuery({
    queryKey: queryKeys.unidades.detail(id),
    queryFn: () => obterUnidade(id),
    enabled: id.length > 0,
    staleTime: 30_000,
  });
}

export function useUnidadeIndicadores(id: string) {
  return useQuery({
    queryKey: queryKeys.unidades.indicators(id),
    queryFn: () => obterIndicadoresUnidade(id),
    enabled: id.length > 0,
    staleTime: 30_000,
  });
}

export function useAlterarStatusUnidade() {
  const queryClient = useQueryClient();
  const { usuario } = useSessao();

  return useMutation({
    mutationFn: (input: { id: string; status: UnidadeStatus }) =>
      alterarStatusUnidade(input.id, input.status, usuario.perfil),
    onSuccess: () => invalidateEntityData(queryClient),
  });
}

export function useAlterarStatusTarefa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { tarefaId: string; status: TarefaStatus }) =>
      alterarStatusTarefa(input.tarefaId, input.status),
    onSuccess: () => invalidateEntityData(queryClient),
  });
}
