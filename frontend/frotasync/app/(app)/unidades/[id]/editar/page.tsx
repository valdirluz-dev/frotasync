import { notFound } from "next/navigation";

import { UnidadeEditarClient } from "@/components/edicao/UnidadeEditarClient";
import { obterUnidadeParaEdicao } from "@/services/unidadesService";

export default async function Page({ params }: PageProps<"/unidades/[id]/editar">) {
  const { id } = await params;
  const unidade = await obterUnidadeParaEdicao(id);
  if (!unidade) notFound();
  return <UnidadeEditarClient id={unidade.id} />;
}
