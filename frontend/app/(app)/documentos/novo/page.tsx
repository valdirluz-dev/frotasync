"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SubmitHandler } from "react-hook-form";

import { AppShell } from "@/components/layout/AppShell";
import { DocumentoForm } from "@/components/documentos/DocumentoForm";
import { ErrorState } from "@/components/ui/StateViews";
import { useToast } from "@/components/ui/Toast";
import { useCatalogoUnidades, useCategoriasDocumento } from "@/hooks/useCatalogos";
import { useCriarDocumento } from "@/hooks/useEdicao";
import type { DocumentoFormValues } from "@/schemas/documento";

export default function NovoDocumentoPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const unidadesQuery = useCatalogoUnidades();
  const categoriasQuery = useCategoriasDocumento();
  const createMutation = useCriarDocumento();
  const [unidadeId, setUnidadeId] = useState("");

  const unidadesAtivas =
    unidadesQuery.data?.filter((unidade) => unidade.status === "Ativa") ?? [];
  const unidadeSelecionada = unidadesAtivas.find(
    (unidade) => unidade.id === unidadeId,
  );

  const handleSubmit: SubmitHandler<DocumentoFormValues> = async (data) => {
    if (!unidadeId) return;
    try {
      await createMutation.mutateAsync({ ...data, unidadeId });
      showToast("Documento criado com sucesso", "success");
      router.push("/documentos");
    } catch {
      showToast("Não foi possível criar o documento. Tente novamente.", "error");
    }
  };

  return (
    <AppShell activeTab="documentos">
      <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Novo Documento</h1>
          <p className="text-xs text-slate-500">
            Preencha as informações abaixo para cadastrar um novo documento.
          </p>
        </div>

        {unidadesQuery.isError || categoriasQuery.isError ? (
          <div className="rounded-2xl bg-white">
            <ErrorState
              label="Não foi possível carregar as opções do formulário."
              onRetry={() => {
                void unidadesQuery.refetch();
                void categoriasQuery.refetch();
              }}
            />
          </div>
        ) : unidadesQuery.isPending || categoriasQuery.isPending ? (
          <p role="status" className="text-sm text-slate-500">
            Carregando opções...
          </p>
        ) : (
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Unidade
              </span>
              <select
                value={unidadeId}
                onChange={(event) => setUnidadeId(event.target.value)}
                required
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700">
                <option value="">Selecione uma unidade ativa</option>
                {unidadesAtivas.map((unidade) => (
                  <option key={unidade.id} value={unidade.id}>
                    {unidade.nome} (ID {unidade.codigo})
                  </option>
                ))}
              </select>
            </label>

            {unidadeSelecionada ? (
              <DocumentoForm
                documento={{
                  id: "",
                  nome: "",
                  categoria: "",
                  unidadeId,
                  dataEmissao: "",
                  dataValidade: "",
                }}
                unidadeId={unidadeId}
                unidadeNome={unidadeSelecionada.nome}
                categorias={categoriasQuery.data ?? []}
                mode="criar"
                isSaving={createMutation.isPending}
                onSubmit={handleSubmit}
                onCancel={() => router.back()}
              />
            ) : unidadesAtivas.length === 0 ? (
              <p className="text-sm text-slate-500">
                Cadastre uma unidade ativa antes de criar documentos.
              </p>
            ) : null}
          </div>
        )}
      </div>
    </AppShell>
  );
}
