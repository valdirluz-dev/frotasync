"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SubmitHandler } from "react-hook-form";

import { EditError } from "@/components/edicao/EditError";
import { EditLoading, EditPageShell } from "@/components/edicao/EditPageShell";
import { DocumentoForm, toDocumentoAnexo } from "@/components/documentos/DocumentoForm";
import { UnidadeInativaDialog } from "@/components/unidades/UnidadeInativaDialog";
import { ConfirmDialog, useToast } from "@/components/ui";
import { useDocumento, useEditarDocumento } from "@/hooks/useEdicao";
import { useUnidade } from "@/hooks/useUnidadeDetalhe";
import { mockCategorias } from "@/mocks/dashboard";
import type { DocumentoFormValues } from "@/schemas/documento";

export function DocumentoEditarClient({ id, unidadeId, porUnidade = false }: { id: string; unidadeId: string; porUnidade?: boolean }) {
  const router = useRouter();
  const { showToast } = useToast();
  const documentQuery = useDocumento(id);
  const unitQuery = useUnidade(unidadeId);
  const mutation = useEditarDocumento();
  const [pending, setPending] = useState<DocumentoFormValues | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const documento = documentQuery.data;
  const unidade = unitQuery.data;
  const inactive = unidade?.status === "Inativa";
  const base = porUnidade ? `/unidades/${unidadeId}?aba=documentos` : `/dashboard?aba=documentos`;
  const back = () => router.push(base);

  const submit: SubmitHandler<DocumentoFormValues> = (values) => { setPending(values); setDialogOpen(true); };
  async function confirm() {
    if (!pending || mutation.isPending) return;
    try {
      const updated = await mutation.mutateAsync({ id, data: pending, anexo: toDocumentoAnexo(pending.anexo) });
      setDialogOpen(false);
      showToast("Documento atualizado com sucesso", "success");
      router.push(`${base}&q=${encodeURIComponent(updated.nome)}`);
    } catch (error) {
      setDialogOpen(false);
      showToast(error instanceof Error && error.message.includes("inativa") ? "Não é possível modificar registros de uma unidade inativa." : "Não foi possível atualizar o documento. Tente novamente.", "error");
    }
  }

  if (documentQuery.isPending || unitQuery.isPending) return <EditPageShell activeTab="documentos" breadcrumb={<span>Dashboard Global / Documentos / Editar Documento</span>} title="Editar documento" backLabel="Voltar para documentos" onBack={back}><EditLoading /></EditPageShell>;
  if (documentQuery.isError || unitQuery.isError || !documento || !unidade || documento.unidadeId !== unidadeId) return <EditPageShell activeTab="documentos" breadcrumb={<span>Dashboard Global / Documentos / Editar Documento</span>} title="Editar documento" backLabel="Voltar para documentos" onBack={back}><EditError onRetry={() => { void documentQuery.refetch(); void unitQuery.refetch(); }} /></EditPageShell>;
  if (inactive) return <EditPageShell activeTab={porUnidade ? "unidades" : "documentos"} breadcrumb={<span>{porUnidade ? `Unidades / ${unidade.nome} (ID ${unidade.codigo}) / Documentos / Editar Documento` : "Dashboard Global / Documentos / Editar Documento"}</span>} title="Editar documento" backLabel="Voltar para documentos" onBack={back}><div className="h-20" /><UnidadeInativaDialog unidade={unidade} open resource="documento" onClose={back} onReturnToUnits={() => router.push("/unidades")} /></EditPageShell>;

  return (
    <EditPageShell
      activeTab={porUnidade ? "unidades" : "documentos"}
      breadcrumb={<><span className="text-slate-500">{porUnidade ? "Unidades" : "Dashboard Global"}</span><span className="text-slate-300">/</span>{porUnidade ? <><span className="max-w-[220px] truncate text-slate-500">{unidade.nome} (ID {unidade.codigo})</span><span className="text-slate-300">/</span></> : null}<span className="text-slate-500">Documentos</span><span className="text-slate-300">/</span><span className="font-semibold text-slate-800">Editar Documento</span></>}
      title="Editar documento"
      backLabel="Voltar para documentos"
      onBack={back}
    >
      <DocumentoForm documento={documento} unidadeNome={unidade.nome} categorias={mockCategorias} mode="editar" isSaving={mutation.isPending} onNoChanges={() => showToast("Nenhuma alteração para salvar", "info")} onCancel={back} onSubmit={submit} />
      <ConfirmDialog open={dialogOpen} title="Deseja salvar as alterações?" description={<p>Você está alterando o documento &quot;<strong>{documento.nome}</strong>&quot;, na unidade &quot;<strong>{unidade.nome} (ID {unidade.codigo})</strong>&quot;, deseja prosseguir com as alterações?</p>} cancelLabel="Cancelar" confirmLabel="Salvar alterações" isLoading={mutation.isPending} onCancel={() => { if (!mutation.isPending) setDialogOpen(false); }} onConfirm={confirm} />
    </EditPageShell>
  );
}
