import { repositories } from "@/repositories";
import { RecursoNaoEncontradoError, UnidadeInativaError } from "@/lib/errors";
import type { Unidade } from "@/types/domain";

export async function obterUnidadeAtiva(unidadeId: string): Promise<Unidade> {
  const unidade = await repositories.unidades.findById(unidadeId);
  if (!unidade) throw new RecursoNaoEncontradoError("Unidade");
  if (unidade.status === "Inativa") throw new UnidadeInativaError();
  return unidade;
}
