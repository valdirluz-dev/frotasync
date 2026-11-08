import { UnidadeEditarClient } from "@/components/edicao/UnidadeEditarClient";

export default async function Page({ params }: PageProps<"/unidades/[id]/editar">) {
  const { id } = await params;
  return <UnidadeEditarClient id={id} />;
}
