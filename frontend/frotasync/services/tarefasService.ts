import { mockTarefas, mockUnidades } from "@/mocks/dashboard";
import { RecursoNaoEncontradoError, UnidadeInativaError } from "@/services/dashboardService";
import type { Tarefa } from "@/types/dashboard";
import type { TarefaFormValues } from "@/schemas/tarefa";

const wait = (ms = 140) => new Promise<void>((resolve) => setTimeout(resolve, ms));

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
