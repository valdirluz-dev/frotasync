import { wait } from "@/lib/mockApi";
import { generateMockTarefas } from "@/mocks/factories/tarefas";
import { mockUnidades } from "@/mocks/unidades";
import type { Tarefa, TarefaStatus } from "@/types/domain";

const taskSeeds: Array<readonly [titulo: string, status: TarefaStatus]> = [
  ["Renovar alvará de funcionamento", "Concluída"],
  ["Enviar relatório mensal", "Em andamento"],
  ["Repor extintores", "Pendente"],
  ["Revisar licença ambiental", "Concluída"],
  ["Atualizar cadastro da unidade", "Em andamento"],
  ["Agendar vistoria técnica", "Pendente"],
  ["Conferir seguro patrimonial", "Concluída"],
  ["Regularizar documentação fiscal", "Pendente"],
  ["Validar certificado de bombeiros", "Em andamento"],
  ["Concluir checklist operacional", "Concluída"],
  ["Solicitar renovação da licença", "Pendente"],
  ["Enviar comprovantes de manutenção", "Em andamento"],
  ["Revisar contratos vigentes", "Concluída"],
  ["Organizar documentos da filial", "Pendente"],
  ["Atualizar laudo elétrico", "Concluída"],
  ["Preparar auditoria trimestral", "Em andamento"],
];

const taskStatuses: TarefaStatus[] = ["Concluída", "Em andamento", "Pendente"];

export const mockTarefas: Tarefa[] = generateMockTarefas(
  mockUnidades,
  taskSeeds,
  taskStatuses,
);

export async function fetchMockTarefas(): Promise<Tarefa[]> {
  await wait(300 + Math.floor(Math.random() * 301));
  return mockTarefas;
}
