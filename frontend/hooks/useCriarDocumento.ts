"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { criarDocumento } from "@/services/documentosService";
import type { DocumentoFormValues } from "@/schemas/documento";
import type { DocumentoAnexo } from "@/types/domain";

export function useCriarDocumento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      data: DocumentoFormValues;
      anexo: DocumentoAnexo;
    }) => criarDocumento(input.data, input.anexo),
    onSuccess: async (documento) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["unidades"] }),
        queryClient.invalidateQueries({
          queryKey: ["unidades", "indicadores", documento.unidadeId],
        }),
      ]);
    },
  });
}
