import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queryKeys";

export async function invalidateEntityData(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.unidades.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.documentos.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.tarefas.all }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.catalogs.documentCategories,
    }),
  ]);
}
