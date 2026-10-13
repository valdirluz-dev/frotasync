import { DocumentoEditarClient } from "@/components/edicao/DocumentoEditarClient";

export default async function Page({ params }: PageProps<"/documentos/[id]/editar">) {
  const { id } = await params;
  return <DocumentoEditarClient id={id} unidadeId="" />;
}
