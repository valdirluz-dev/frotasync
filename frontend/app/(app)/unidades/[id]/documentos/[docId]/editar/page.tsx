import { DocumentoEditarClient } from "@/components/edicao/DocumentoEditarClient";

export default async function Page({ params }: PageProps<"/unidades/[id]/documentos/[docId]/editar">) {
  const { id, docId } = await params;
  return <DocumentoEditarClient id={docId} unidadeId={id} porUnidade />;
}
