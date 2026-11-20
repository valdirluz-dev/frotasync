import { NovoDocumentoClient } from "@/components/documentos/NovoDocumentoClient";

export default async function NovoDocumentoPorUnidadePage({
  params,
}: PageProps<"/unidades/[id]/documentos/novo">) {
  const { id } = await params;
  return <NovoDocumentoClient unidadeId={id} />;
}
