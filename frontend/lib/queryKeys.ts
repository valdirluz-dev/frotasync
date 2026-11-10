import type { DocumentFilters, TaskFilters, UnidadesFilters } from "@/types/domain";

export const queryKeys = {
  dashboard: {
    all: ["dashboard"] as const,
    indicators: ["dashboard", "indicators"] as const,
    documents: (filters?: DocumentFilters) =>
      filters
        ? (["dashboard", "documents", filters] as const)
        : (["dashboard", "documents"] as const),
    tasks: (filters?: TaskFilters) =>
      filters
        ? (["dashboard", "tasks", filters] as const)
        : (["dashboard", "tasks"] as const),
  },
  unidades: {
    all: ["unidades"] as const,
    list: (filters?: UnidadesFilters) =>
      filters
        ? (["unidades", "lista", filters] as const)
        : (["unidades", "lista"] as const),
    detail: (id: string) => ["unidades", "detalhe", id] as const,
    indicators: (id: string) => ["unidades", "indicadores", id] as const,
    catalog: ["unidades", "catalogo"] as const,
  },
  documentos: {
    all: ["documentos"] as const,
    detail: (id: string) => ["documentos", "detalhe", id] as const,
  },
  tarefas: {
    all: ["tarefas"] as const,
    detail: (id: string) => ["tarefas", "detalhe", id] as const,
  },
  catalogs: {
    documentCategories: ["catalogos", "documentos", "categorias"] as const,
  },
} as const;
