import type { Tarefa, TarefaStatus, Unidade } from "@/types/domain";
import { dateOffset } from "@/utils/date";

type TarefaSeed = readonly [titulo: string, status: TarefaStatus];

export function generateMockTarefas(
  unidades: readonly Unidade[],
  seeds: readonly TarefaSeed[],
  statuses: readonly TarefaStatus[],
): Tarefa[] {
  return Array.from({ length: 128 }, (_, index) => {
    const [titulo] = seeds[index % seeds.length];
    const unidadeIndex = index % unidades.length;
    const unitTaskIndex = Math.floor(index / unidades.length);
    const status = statuses[(unidadeIndex + unitTaskIndex) % statuses.length];
    const startOffset = -((index % 70) + 1);
    const completed = status === "Concluída";

    return {
      id: `task-${String(index + 1).padStart(3, "0")}`,
      titulo,
      unidadeId: unidades[unidadeIndex].id,
      dataInicio: dateOffset(startOffset),
      prazoFinal: dateOffset(startOffset + (index % 24) + 3),
      status,
      dataConclusao: completed ? dateOffset(Math.min(startOffset + 2, -1)) : null,
      descricao: `Detalhes da tarefa: ${titulo.toLocaleLowerCase("pt-BR")}.`,
    };
  });
}
