"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  alterarStatusTarefa,
  alterarStatusUnidade,
  obterIndicadoresUnidade,
  obterUnidade,
} from "@/services/dashboardService";
import { useSessao } from "@/hooks/useSessao";
import type { TarefaStatus, UnidadeStatus } from "@/types/dashboard";

export function useUnidade(id: string) {
  return useQuery({
    queryKey: ["unidades", "detalhe", id],
    queryFn: () => obterUnidade(id),
    enabled: id.length > 0,
    staleTime: 30_000,
  });
}

export function useUnidadeIndicadores(id: string) {
  return useQuery({
    queryKey: ["unidades", "indicadores", id],
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
    onSuccess: async (unidade) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["unidades"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({
          queryKey: ["unidades", "indicadores", unidade.id],
        }),
      ]);
    },
  });
}

export function useAlterarStatusTarefa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { tarefaId: string; status: TarefaStatus }) =>
      alterarStatusTarefa(input.tarefaId, input.status),
    onSuccess: async (tarefa) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["unidades"] }),
        queryClient.invalidateQueries({
          queryKey: ["unidades", "indicadores", tarefa.unidadeId],
        }),
      ]);
    },
  });
}
