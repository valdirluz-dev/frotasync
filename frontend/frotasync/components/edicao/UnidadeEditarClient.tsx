"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SubmitHandler } from "react-hook-form";

import { EditError } from "@/components/edicao/EditError";
import { EditLoading } from "@/components/edicao/EditPageShell";
import { EditPageShell } from "@/components/edicao/EditPageShell";
import { UnidadeForm, type UnidadeFormHandle } from "@/components/unidades/UnidadeForm";
import { ConfirmDialog } from "@/components/ui";
import { useToast } from "@/components/ui/Toast";
import { useEditarUnidade, useUnidadeParaEdicao } from "@/hooks/useEdicao";
import { IdentificadorUnidadeDuplicadoError } from "@/services/unidadesService";
import type { UnidadeFormValues } from "@/schemas/unidade";

function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

export function UnidadeEditarClient({ id }: { id: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const query = useUnidadeParaEdicao(id);
  const mutation = useEditarUnidade();
  const formRef = useRef<UnidadeFormHandle>(null);
  const [pending, setPending] = useState<UnidadeFormValues | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const unidade = query.data;

  const submit: SubmitHandler<UnidadeFormValues> = useCallback((values) => {
    setPending(values);
    setDialogOpen(true);
  }, []);

  async function confirm() {
    if (!pending || mutation.isPending) return;
    try {
      const updated = await mutation.mutateAsync({ id, data: pending });
      setDialogOpen(false);
      showToast("Unidade atualizada com sucesso", "success");
      router.push(`/unidades/${updated.id}`);
    } catch (error) {
      setDialogOpen(false);
      if (error instanceof IdentificadorUnidadeDuplicadoError) {
        formRef.current?.setIdentifierError(error.message);
        window.requestAnimationFrame(() => formRef.current?.focusIdentifier());
      } else {
        showToast("Não foi possível atualizar a unidade. Tente novamente.", "error");
      }
    }
  }

  if (query.isPending && !unidade) return <EditPageShell activeTab="unidades" breadcrumb={<span>Unidades / Editar</span>} title="Editar unidade" backLabel="Voltar para unidade" onBack={() => router.push(`/unidades/${id}`)}><EditLoading /></EditPageShell>;
  if (query.isError || !unidade) return <EditPageShell activeTab="unidades" breadcrumb={<span>Unidades / Editar</span>} title="Editar unidade" backLabel="Voltar para unidade" onBack={() => router.push(`/unidades/${id}`)}><EditError onRetry={() => void query.refetch()} /></EditPageShell>;

  return (
    <EditPageShell
      activeTab="unidades"
      breadcrumb={<><span className="text-slate-500">Unidades</span><span className="text-slate-300">/</span><span className="max-w-[240px] truncate text-slate-500">{unidade.nome} (ID {unidade.codigo})</span><span className="text-slate-300">/</span><span className="font-semibold text-slate-800">Editar</span></>}
      title="Editar unidade"
      backLabel="Voltar para unidade"
      onBack={() => router.push(`/unidades/${id}`)}
    >
      <p className="-mt-4 mb-7 text-xs text-slate-400">Criada em {formatDate(unidade.criadoEm)} · Última modificação {formatDate(unidade.atualizadoEm)}</p>
      <UnidadeForm
        ref={formRef}
        mode="editar"
        isSaving={mutation.isPending}
        defaultValues={{ nome: unidade.nome, identificador: unidade.codigo, cep: unidade.endereco.cep ?? "", logradouro: unidade.endereco.logradouro, numero: unidade.endereco.numero, complemento: unidade.endereco.complemento ?? "", bairro: unidade.endereco.bairro, cidade: unidade.endereco.cidade, uf: unidade.endereco.uf, descricao: unidade.descricao ?? "" }}
        onNoChanges={() => showToast("Nenhuma alteração para salvar", "info")}
        onCancel={() => router.push(`/unidades/${id}`)}
        onSubmit={submit}
      />
      <ConfirmDialog
        open={dialogOpen}
        title="Deseja salvar as alterações?"
        description={<p>Você está alterando a unidade &quot;<strong>{unidade.nome} (ID {unidade.codigo})</strong>&quot;, deseja prosseguir com as alterações?</p>}
        cancelLabel="Cancelar"
        confirmLabel="Salvar alterações"
        isLoading={mutation.isPending}
        onCancel={() => { if (!mutation.isPending) setDialogOpen(false); }}
        onConfirm={confirm}
      />
    </EditPageShell>
  );
}
