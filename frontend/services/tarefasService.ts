import { RecursoNaoEncontradoError } from "@/lib/errors";
import { repositories } from "@/repositories";
import type { TarefaFormValues } from "@/schemas/tarefa";
import type { Tarefa, TarefaStatus } from "@/types/domain";

import { obterUnidadeAtiva } from "./serviceRules";

export type CriarTarefaInput = TarefaFormValues & { unidadeId: string };

export async function listarTarefas(): Promise<Tarefa[]> {
  return repositories.tarefas.list();
}

export async function obterTarefa(id: string): Promise<Tarefa | null> {
  return repositories.tarefas.findById(id);
}

export async function criarTarefa(data: CriarTarefaInput): Promise<Tarefa> {
  await obterUnidadeAtiva(data.unidadeId);
  const tarefa = {
    unidadeId: data.unidadeId,
    titulo: data.titulo.trim(),
    dataInicio: new Date().toISOString(),
    prazoFinal: data.prazoFinal,
    status: "Pendente" as const,
    dataConclusao: null,
    descricao: data.descricao?.trim() || undefined,
  };
  return repositories.tarefas.insert(tarefa);
}

export async function atualizarTarefa(
  id: string,
  data: TarefaFormValues,
): Promise<Tarefa> {
  const current = await repositories.tarefas.findById(id);
  if (!current) throw new RecursoNaoEncontradoError("Tarefa");
  await obterUnidadeAtiva(current.unidadeId);

  const updated: Tarefa = {
    ...current,
    titulo: data.titulo.trim(),
    prazoFinal: data.prazoFinal,
    descricao: data.descricao?.trim() || undefined,
  };
  return repositories.tarefas.update(updated);
}

export async function alterarStatusTarefa(
  tarefaId: string,
  status: TarefaStatus,
): Promise<Tarefa> {
  const tarefa = await repositories.tarefas.findById(tarefaId);
  if (!tarefa) throw new RecursoNaoEncontradoError("Tarefa");
  const unidade = await obterUnidadeAtiva(tarefa.unidadeId);

  const updated: Tarefa = {
    ...tarefa,
    status,
    dataConclusao: status === "Concluída" ? new Date().toISOString() : null,
  };
  const savedTask = await repositories.tarefas.update(updated);
  await repositories.unidades.update({
    ...unidade,
    atualizadoEm: new Date().toISOString(),
  });
  return savedTask;
}

export async function excluirTarefa(id: string): Promise<void> {
  const tarefa = await repositories.tarefas.findById(id);
  if (!tarefa) throw new RecursoNaoEncontradoError("Tarefa");
  await obterUnidadeAtiva(tarefa.unidadeId);
  const removed = await repositories.tarefas.remove(id);
  if (!removed) throw new RecursoNaoEncontradoError("Tarefa");
}
