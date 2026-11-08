import { Suspense } from "react";

import { UnidadeDetalheClient } from "@/components/unidades/UnidadeDetalheClient";

export default async function UnidadePage({ params }: PageProps<"/unidades/[id]">) {
  const { id } = await params;
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface" aria-label="Carregando unidade" />}>
      <UnidadeDetalheClient id={id} />
    </Suspense>
  );
}
