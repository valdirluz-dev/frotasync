import { notFound } from "next/navigation";

import { DocumentoEditarClient } from "@/components/edicao/DocumentoEditarClient";
import { obterDocumento } from "@/services/documentosService";
import { obterUnidade } from "@/services/dashboardService";

export default async function Page({ params }: PageProps<"/unidades/[id]/documentos/[docId]/editar">) {
  const { id, docId } = await params;
  const [documento, unidade] = await Promise.all([obterDocumento(docId), obterUnidade(id)]);
  if (!documento || !unidade || documento.unidadeId !== id) notFound();
  return <DocumentoEditarClient id={documento.id} unidadeId={unidade.id} porUnidade />;
}
