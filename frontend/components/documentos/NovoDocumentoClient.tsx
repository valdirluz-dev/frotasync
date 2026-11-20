"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { SubmitHandler } from "react-hook-form";

import { AppShell } from "@/components/layout/AppShell";
import { DocumentoForm, toDocumentoAnexo } from "@/components/documentos/DocumentoForm";
import { ErrorState, LoadingState } from "@/components/ui/StateViews";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useCriarDocumento } from "@/hooks/useCriarDocumento";
import { useUnidade } from "@/hooks/useUnidadeDetalhe";
import { useUnidades } from "@/hooks/useUnidades";
import { mockCategorias } from "@/mocks/dashboard";
import type { DocumentoFormValues } from "@/schemas/documento";
import type { Documento } from "@/types/domain";

export function NovoDocumentoClient({ unidadeId }: { unidadeId?: string }) {
  const router = useRouter();
  const { showToast } = useToast();
  const unidadeQuery = useUnidade(unidadeId ?? "");
  const unidadesQuery = useUnidades({
    page: 1,
    size: 100,
    status: "Ativa",
  });
  const mutation = useCriarDocumento();
  const [pending, setPending] = useState<DocumentoFormValues | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const creatingLocally = Boolean(unidadeId);
  const unidadesAtivas = unidadesQuery.data?.items ?? [];
  const unidade = unidadeQuery.data;
  const unidadeOptions = useMemo(
    () =>
      (unidadesQuery.data?.items ?? []).map(({ id, nome, codigo }) => ({
        id,
        nome,
        codigo,
      })),
    [unidadesQuery.data?.items],
  );
  const selectedUnit = pending
    ? unidadeOptions.find((item) => item.id === pending.unidadeId) ??
      (unidade?.id === pending.unidadeId ? unidade : undefined)
    : undefined;
  const backPath = creatingLocally
    ? `/unidades/${unidadeId}?aba=documentos`
    : "/documentos";

  const submit: SubmitHandler<DocumentoFormValues> = (values) => {
    setPending(values);
    setDialogOpen(true);
  };

  async function confirm() {
    if (!pending || mutation.isPending) return;
    const anexo = toDocumentoAnexo(pending.anexo);
    if (!anexo) {
      setDialogOpen(false);
      showToast("Anexe um arquivo válido antes de cadastrar o documento.", "error");
      return;
    }

    try {
      await mutation.mutateAsync({ data: pending, anexo });
      setDialogOpen(false);
      showToast("Documento cadastrado com sucesso", "success");
      router.push(backPath);
    } catch (error) {
      setDialogOpen(false);
      showToast(
        error instanceof Error
          ? error.message
          : "Não foi possível cadastrar o documento. Tente novamente.",
        "error",
      );
    }
  }

  if (creatingLocally && unidadeQuery.isPending) {
    return (
      <AppShell activeTab="unidades">
        <LoadingState label="Carregando unidade..." />
      </AppShell>
    );
  }

  if (creatingLocally && (unidadeQuery.isError || !unidade)) {
    return (
      <AppShell activeTab="unidades">
        <ErrorState
          label="Não foi possível carregar a unidade."
          onRetry={() => void unidadeQuery.refetch()}
        />
      </AppShell>
    );
  }

  if (creatingLocally && unidade?.status === "Inativa") {
    return (
      <AppShell activeTab="unidades">
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          Não é possível cadastrar documentos em uma unidade inativa.
          <button
            type="button"
            onClick={() => router.push(backPath)}
            className="ml-2 font-semibold underline">
            Voltar para a unidade
          </button>
        </div>
      </AppShell>
    );
  }

  if (!creatingLocally && unidadesQuery.isPending) {
    return (
      <AppShell activeTab="documentos">
        <LoadingState label="Carregando unidades ativas..." />
      </AppShell>
    );
  }

  if (!creatingLocally && unidadesQuery.isError) {
    return (
      <AppShell activeTab="documentos">
        <ErrorState
          label="Não foi possível carregar as unidades ativas."
          onRetry={() => void unidadesQuery.refetch()}
        />
      </AppShell>
    );
  }

  if (!creatingLocally && unidadesAtivas.length === 0) {
    return (
      <AppShell activeTab="documentos">
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
          Cadastre ou ative uma unidade antes de cadastrar documentos.
        </div>
      </AppShell>
    );
  }

  const documentoVazio: Documento = {
    id: "",
    nome: "",
    categoria: "",
    unidadeId: "",
    dataEmissao: null,
    dataValidade: "",
  };
  const selectedDefaultId = creatingLocally
    ? (unidade?.id ?? "")
    : (unidadesAtivas[0]?.id ?? "");
  const displayUnitName = creatingLocally ? unidade?.nome ?? "" : "";

  return (
    <AppShell activeTab={creatingLocally ? "unidades" : "documentos"}>
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Novo documento</h1>
          <p className="text-xs text-slate-500">
            Preencha as informações abaixo para cadastrar um novo documento.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <DocumentoForm
            documento={{ ...documentoVazio, unidadeId: selectedDefaultId }}
            unidadeNome={displayUnitName}
            categorias={mockCategorias}
            unidades={creatingLocally ? undefined : unidadeOptions}
            unidadeBloqueada={creatingLocally}
            mode="criar"
            defaultValues={{ unidadeId: selectedDefaultId }}
            isSaving={mutation.isPending}
            onSubmit={submit}
            onCancel={() => router.push(backPath)}
          />
        </div>
      </div>

      <ConfirmDialog
        open={dialogOpen}
        title="Deseja cadastrar o documento?"
        description={
          <p>
            O documento <strong>{pending?.nome}</strong> será cadastrado na
            unidade <strong>{selectedUnit?.nome ?? displayUnitName}</strong>.
            Deseja prosseguir?
          </p>
        }
        cancelLabel="Cancelar"
        confirmLabel="Cadastrar documento"
        isLoading={mutation.isPending}
        onCancel={() => {
          if (!mutation.isPending) setDialogOpen(false);
        }}
        onConfirm={confirm}
      />
    </AppShell>
  );
}
