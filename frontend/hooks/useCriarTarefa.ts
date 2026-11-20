"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { TarefaFormValues } from "@/schemas/tarefa";
import { criarTarefa } from "@/services/tarefasService";

export function useCriarTarefa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: TarefaFormValues) => criarTarefa(values),
    onSuccess: async (tarefa) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["unidades"] }),
        queryClient.invalidateQueries({ queryKey: ["historico-alteracoes"] }),
        queryClient.invalidateQueries({ queryKey: ["unidades", "historico"] }),
        queryClient.invalidateQueries({
          queryKey: ["unidades", "indicadores", tarefa.unidadeId],
        }),
      ]);
    },
  });
}
