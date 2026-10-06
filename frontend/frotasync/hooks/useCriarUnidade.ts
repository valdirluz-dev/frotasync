"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { criarUnidade } from "@/services/unidadesService";
import type { UnidadeFormValues } from "@/schemas/unidade";

export function useCriarUnidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: UnidadeFormValues) => criarUnidade(values),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["unidades"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
  });
}
