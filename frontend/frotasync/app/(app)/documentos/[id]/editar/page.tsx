import { notFound } from "next/navigation";

import { DocumentoEditarClient } from "@/components/edicao/DocumentoEditarClient";
import { obterDocumento } from "@/services/documentosService";
import { obterUnidade } from "@/services/dashboardService";

export default async function Page({ params }: PageProps<"/documentos/[id]/editar">) {
  const { id } = await params;
  const documento = await obterDocumento(id);
  if (!documento) notFound();
  const unidade = await obterUnidade(documento.unidadeId);
  if (!unidade) notFound();
  return <DocumentoEditarClient id={documento.id} unidadeId={unidade.id} />;
}
