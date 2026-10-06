import { Suspense } from "react";
import { notFound } from "next/navigation";

import { UnidadeDetalheClient } from "@/components/unidades/UnidadeDetalheClient";
import { obterUnidade } from "@/services/dashboardService";

export default async function UnidadePage({
  params,
}: PageProps<"/unidades/[id]">) {
  const { id } = await params;
  const unidade = await obterUnidade(id);
  if (!unidade) notFound();

  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen bg-[#F8F9FC]"
          aria-label="Carregando unidade"
        />
      }>
      <UnidadeDetalheClient id={unidade.id} />
    </Suspense>
  );
}
