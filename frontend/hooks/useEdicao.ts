"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";
import { invalidateEntityData } from "@/hooks/invalidateEntityData";
import {
  atualizarUnidade,
  obterUnidadeParaEdicao,
} from "@/services/unidadesService";
import {
  atualizarDocumento,
  criarDocumento,
  excluirDocumento,
  obterDocumento,
  type CriarDocumentoInput,
} from "@/services/documentosService";
import {
  atualizarTarefa,
  criarTarefa,
  excluirTarefa,
  obterTarefa,
  type CriarTarefaInput,
} from "@/services/tarefasService";
import type { DocumentoFormValues } from "@/schemas/documento";
import type { TarefaFormValues } from "@/schemas/tarefa";
import type { UnidadeFormValues } from "@/schemas/unidade";
import type { DocumentoAnexo } from "@/types/domain";

export function useCriarDocumento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CriarDocumentoInput) => criarDocumento(input),
    onSuccess: () => invalidateEntityData(queryClient),
  });
}

export function useExcluirDocumento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => excluirDocumento(id),
    onSuccess: () => invalidateEntityData(queryClient),
  });
}

export function useCriarTarefa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CriarTarefaInput) => criarTarefa(input),
    onSuccess: () => invalidateEntityData(queryClient),
  });
}

export function useExcluirTarefa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => excluirTarefa(id),
    onSuccess: () => invalidateEntityData(queryClient),
  });
}

export function useEditarUnidade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; data: UnidadeFormValues }) =>
      atualizarUnidade(input.id, input.data),
    onSuccess: () => invalidateEntityData(queryClient),
  });
}

export function useEditarDocumento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      id: string;
      data: DocumentoFormValues;
      anexo?: DocumentoAnexo;
    }) => atualizarDocumento(input.id, input.data, input.anexo),
    onSuccess: () => invalidateEntityData(queryClient),
  });
}

export function useEditarTarefa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; data: TarefaFormValues }) =>
      atualizarTarefa(input.id, input.data),
    onSuccess: () => invalidateEntityData(queryClient),
  });
}

export function useDocumento(id: string) {
  return useQuery({
    queryKey: queryKeys.documentos.detail(id),
    queryFn: () => obterDocumento(id),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useTarefa(id: string) {
  return useQuery({
    queryKey: queryKeys.tarefas.detail(id),
    queryFn: () => obterTarefa(id),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}

export function useUnidadeParaEdicao(id: string) {
  return useQuery({
    queryKey: queryKeys.unidades.detail(id),
    queryFn: () => obterUnidadeParaEdicao(id),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}
