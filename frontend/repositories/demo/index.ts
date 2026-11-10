import { mockCategorias, mockDocumentos } from "@/mocks/documentos";
import { mockTarefas } from "@/mocks/tarefas";
import { mockUnidades } from "@/mocks/unidades";
import type { DataRepositories } from "@/repositories/contracts";
import { wait } from "@/lib/mockApi";

import { createMemoryRepository, nextNumericId } from "./memoryRepository";

export const demoRepositories: DataRepositories = {
  unidades: createMemoryRepository(mockUnidades, (unidade, records) => ({
    ...unidade,
    id: nextNumericId("u", records),
  })),
  documentos: {
    ...createMemoryRepository(mockDocumentos, (documento, records) => ({
      ...documento,
      id: nextNumericId("doc", records),
    })),
    async listCategories() {
      await wait();
      return [...mockCategorias];
    },
  },
  tarefas: createMemoryRepository(mockTarefas, (tarefa, records) => ({
    ...tarefa,
    id: nextNumericId("task", records),
  })),
};
