import { DocumentoEditarClient } from "@/components/edicao/DocumentoEditarClient";
import { obterDocumento } from "@/services/documentosService";

export default async function Page({
  params,
}: PageProps<"/documentos/[id]/editar">) {
  const { id } = await params;
  const document = await obterDocumento(id);
  return <DocumentoEditarClient id={id} unidadeId={document?.unidadeId ?? ""} />;
}
