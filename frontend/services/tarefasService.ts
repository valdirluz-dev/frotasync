import { mockTarefas, mockUnidades } from "@/mocks/dashboard";
import { RecursoNaoEncontradoError, UnidadeInativaError } from "@/lib/errors";
import { wait } from "@/lib/mockApi";
import type { Tarefa, TarefaStatus } from "@/types/domain";
import type { TarefaFormValues } from "@/schemas/tarefa";

export async function obterTarefa(id: string): Promise<Tarefa | null> {
  await wait(120);
  return mockTarefas.find((item) => item.id === id) ?? null;
}

export async function atualizarTarefa(id: string, data: TarefaFormValues): Promise<Tarefa> {
  await wait();
  const index = mockTarefas.findIndex((item) => item.id === id);
  if (index < 0) throw new RecursoNaoEncontradoError("Tarefa");
  const current = mockTarefas[index];
  const unidade = mockUnidades.find((item) => item.id === current.unidadeId);
  if (!unidade) throw new RecursoNaoEncontradoError("Unidade");
  if (unidade.status === "Inativa") throw new UnidadeInativaError();

  const updated: Tarefa = {
    ...current,
    titulo: data.titulo.trim(),
    prazoFinal: data.prazoFinal,
    descricao: data.descricao?.trim() || undefined,
    status: current.status,
    dataInicio: current.dataInicio,
    dataConclusao: current.dataConclusao,
  };
  mockTarefas[index] = updated;
  return updated;
}

export async function alterarStatusTarefa(
  tarefaId: string,
  status: TarefaStatus,
): Promise<Tarefa> {
  await wait(120);
  const tarefaIndex = mockTarefas.findIndex((tarefa) => tarefa.id === tarefaId);
  if (tarefaIndex < 0) throw new RecursoNaoEncontradoError("Tarefa");

  const tarefa = mockTarefas[tarefaIndex];
  const unidade = mockUnidades.find((item) => item.id === tarefa.unidadeId);
  if (!unidade) throw new RecursoNaoEncontradoError("Unidade");
  if (unidade.status === "Inativa") throw new UnidadeInativaError();

  const updated: Tarefa = {
    ...tarefa,
    status,
    dataConclusao: status === "Concluída" ? new Date().toISOString() : null,
  };
  mockTarefas[tarefaIndex] = updated;
  const unidadeIndex = mockUnidades.findIndex((item) => item.id === unidade.id);
  mockUnidades[unidadeIndex] = {
    ...unidade,
    atualizadoEm: new Date().toISOString(),
  };
  return updated;
}
