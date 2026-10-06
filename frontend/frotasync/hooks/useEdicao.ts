"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { atualizarUnidade, obterUnidadeParaEdicao } from "@/services/unidadesService";
import { atualizarDocumento, obterDocumento } from "@/services/documentosService";
import { atualizarTarefa, obterTarefa } from "@/services/tarefasService";
import type { DocumentoFormValues } from "@/schemas/documento";
import type { TarefaFormValues } from "@/schemas/tarefa";
import type { UnidadeFormValues } from "@/schemas/unidade";
import type { DocumentoAnexo } from "@/types/dashboard";

async function invalidateEntity(queryClient: ReturnType<typeof useQueryClient>, kind: "unidade" | "documento" | "tarefa", id: string, unidadeId?: string) {
  const keys = [
    ["dashboard"],
    ["dashboard", "indicators"],
    ["dashboard", "documents"],
    ["dashboard", "tasks"],
    ["unidades"],
  ];
  if (kind === "unidade") {
    keys.push(["unidades", "detalhe", id], ["unidades", "indicadores", id]);
  } else if (unidadeId) {
    keys.push(["unidades", "detalhe", unidadeId], ["unidades", "indicadores", unidadeId]);
  }
  await Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
}

export function useEditarUnidade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; data: UnidadeFormValues }) => atualizarUnidade(input.id, input.data),
    onSuccess: (unidade) => invalidateEntity(queryClient, "unidade", unidade.id),
  });
}

export function useEditarDocumento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; data: DocumentoFormValues; anexo?: DocumentoAnexo }) => atualizarDocumento(input.id, input.data, input.anexo),
    onSuccess: (documento) => invalidateEntity(queryClient, "documento", documento.id, documento.unidadeId),
  });
}

export function useEditarTarefa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; data: TarefaFormValues }) => atualizarTarefa(input.id, input.data),
    onSuccess: (tarefa) => invalidateEntity(queryClient, "tarefa", tarefa.id, tarefa.unidadeId),
  });
}

export function useDocumento(id: string) {
  return useQuery({ queryKey: ["documentos", "detalhe", id], queryFn: () => obterDocumento(id), enabled: Boolean(id), staleTime: 30_000 });
}

export function useTarefa(id: string) {
  return useQuery({ queryKey: ["tarefas", "detalhe", id], queryFn: () => obterTarefa(id), enabled: Boolean(id), staleTime: 30_000 });
}

export function useUnidadeParaEdicao(id: string) {
  return useQuery({ queryKey: ["unidades", "detalhe", id], queryFn: () => obterUnidadeParaEdicao(id), enabled: Boolean(id), staleTime: 30_000 });
}
