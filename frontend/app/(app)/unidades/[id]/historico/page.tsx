import { HistoricoUnidadePageClient } from "@/components/unidades/HistoricoUnidadePageClient";

export default async function HistoricoUnidadePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <HistoricoUnidadePageClient unidadeId={id} />;
}
