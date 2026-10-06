"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SubmitHandler } from "react-hook-form";

import { AppShell } from "@/components/dashboard/AppShell";
import { Icon } from "@/components/dashboard/Icons";
import { Button, ConfirmDialog, useToast } from "@/components/ui";
import {
  UnidadeForm,
  type UnidadeFormHandle,
} from "@/components/unidades/UnidadeForm";
import { useCriarUnidade } from "@/hooks/useCriarUnidade";
import { IdentificadorUnidadeDuplicadoError } from "@/services/unidadesService";
import type { UnidadeFormValues } from "@/schemas/unidade";

export default function NovaUnidadePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const createMutation = useCriarUnidade();
  const submissionLock = useRef(false);
  const formRef = useRef<UnidadeFormHandle>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<UnidadeFormValues | null>(
    null,
  );

  const handleValidSubmit: SubmitHandler<UnidadeFormValues> = useCallback(
    (values) => {
      setPendingValues(values);
      setDialogOpen(true);
    },
    [],
  );

  async function handleConfirm() {
    if (!pendingValues || submissionLock.current) return;
    submissionLock.current = true;

    try {
      const unidade = await createMutation.mutateAsync(pendingValues);
      showToast("Unidade cadastrada com sucesso", "success");
      router.push(`/unidades?q=${encodeURIComponent(unidade.codigo)}`);
    } catch (error) {
      setDialogOpen(false);
      if (error instanceof IdentificadorUnidadeDuplicadoError) {
        formRef.current?.setIdentifierError(error.message);
        window.requestAnimationFrame(() => formRef.current?.focusIdentifier());
      } else {
        showToast(
          "Não foi possível cadastrar a unidade. Tente novamente.",
          "error",
        );
      }
    } finally {
      submissionLock.current = false;
    }
  }

  const closeDialog = useCallback(() => {
    if (createMutation.isPending) return;
    setDialogOpen(false);
  }, [createMutation.isPending]);

  return (
    <AppShell activeTab="unidades" breadcrumb="newUnit">
      <section className="mx-auto max-w-[1280px]">
        <Button
          type="button"
          variant="primary"
          leadingIcon={<Icon name="left" className="h-4 w-4" />}
          onClick={() => router.push("/unidades")}
          className="rounded-lg px-3.5 py-2 text-xs">
          Voltar para unidades
        </Button>

        <h1 className="mb-7 mt-6 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Cadastrar Unidade
        </h1>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7 lg:p-9">
          <UnidadeForm
            ref={formRef}
            mode="criar"
            isSaving={createMutation.isPending}
            onCancel={() => router.push("/unidades")}
            onSubmit={handleValidSubmit}
          />
        </div>
      </section>

      <ConfirmDialog
        open={dialogOpen}
        title="Deseja cadastrar a unidade?"
        description={
          <p>
            Você está cadastrando a unidade &quot;
            <strong>
              {pendingValues?.nome} (ID {pendingValues?.identificador})
            </strong>
            &quot;. Deseja prosseguir com a criação?
          </p>
        }
        cancelLabel="Cancelar"
        confirmLabel="Cadastrar Unidade"
        isLoading={createMutation.isPending}
        onCancel={closeDialog}
        onConfirm={handleConfirm}
      />
    </AppShell>
  );
}
