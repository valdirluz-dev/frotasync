"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { criarDocumento } from "@/services/documentosService";
import type { DocumentoFormValues } from "@/schemas/documento";
export function useCriarDocumento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      data: DocumentoFormValues;
      anexo: File;
    }) => criarDocumento(input.data, input.anexo),
    onSuccess: async (documento) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["unidades"] }),
        queryClient.invalidateQueries({ queryKey: ["historico-alteracoes"] }),
        queryClient.invalidateQueries({ queryKey: ["unidades", "historico"] }),
        queryClient.invalidateQueries({
          queryKey: ["unidades", "indicadores", documento.unidadeId],
        }),
      ]);
    },
  });
}
