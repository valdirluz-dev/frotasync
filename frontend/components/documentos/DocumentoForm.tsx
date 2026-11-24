"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";

import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button, FormField, Input, Select, Textarea } from "@/components/ui";
import { calcularStatusDocumento } from "@/lib/status";
import {
  documentoCadastroSchema,
  documentoSchema,
  type DocumentoFormInput,
  type DocumentoFormValues,
} from "@/schemas/documento";
import type { Documento } from "@/types/domain";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type UnidadeOption = { id: string; nome: string; codigo: string };

type DocumentoFormProps = {
  documento: Documento;
  unidadeNome: string;
  categorias: string[];
  unidades?: UnidadeOption[];
  unidadeBloqueada?: boolean;
  mode?: "criar" | "editar";
  defaultValues?: Partial<DocumentoFormInput>;
  isSaving?: boolean;
  onSubmit: SubmitHandler<DocumentoFormValues>;
  onCancel: () => void;
  onNoChanges?: () => void;
};

export function DocumentoForm({
  documento,
  unidadeNome,
  categorias,
  unidades,
  unidadeBloqueada = false,
  mode = "editar",
  defaultValues,
  isSaving = false,
  onSubmit,
  onCancel,
  onNoChanges,
}: DocumentoFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | undefined>();
  const initial = useMemo<DocumentoFormInput>(
    () => ({
      nome: documento.nome,
      unidadeId: documento.unidadeId,
      categoria: documento.categoria,
      dataEmissao: documento.dataEmissao ?? "",
      dataValidade: documento.dataValidade,
      descricao: documento.descricao ?? "",
      ...defaultValues,
    }),
    [defaultValues, documento],
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<DocumentoFormInput, unknown, DocumentoFormValues>({
    resolver: zodResolver(
      mode === "criar" ? documentoCadastroSchema : documentoSchema,
    ),
    defaultValues: initial,
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  const validade = useWatch({ control, name: "dataValidade" });
  const descricao = useWatch({ control, name: "descricao" }) ?? "";
  const anexoSize = selectedFile?.size ?? documento.anexo?.tamanhoBytes;
  const statusPreview = validade ? calcularStatusDocumento(validade) : null;
  const busy = isSaving || isSubmitting;

  function error(field: keyof DocumentoFormInput) {
    const message = errors[field]?.message;
    return typeof message === "string" ? message : undefined;
  }

  function submit(values: DocumentoFormValues) {
    if (mode === "editar" && !isDirty) {
      onNoChanges?.();
      return;
    }
    onSubmit({ ...values, anexo: selectedFile });
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      noValidate
      className="grid grid-cols-1 gap-x-10 gap-y-7 lg:grid-cols-2">
      <div className="space-y-5">
        <FormField
          id="documento-nome"
          label="Nome do documento"
          required
          error={error("nome")}>
          <Input
            id="documento-nome"
            aria-required="true"
            aria-invalid={Boolean(errors.nome)}
            placeholder="Digite o nome do documento..."
            {...register("nome")}
          />
        </FormField>
        <FormField
          id="documento-unidade"
          label="Unidade"
          required
          error={error("unidadeId")}>
          {unidades ? (
            <Select
              id="documento-unidade"
              aria-required="true"
              aria-invalid={Boolean(errors.unidadeId)}
              {...register("unidadeId")}>
              <option value="">Selecione uma unidade ativa</option>
              {unidades.map((unidade) => (
                <option key={unidade.id} value={unidade.id}>
                  {unidade.nome} (ID {unidade.codigo})
                </option>
              ))}
            </Select>
          ) : mode === "criar" && unidadeBloqueada ? (
            <>
              <input type="hidden" {...register("unidadeId")} />
              <div className="relative">
                <Select
                  id="documento-unidade"
                  value={documento.unidadeId}
                  disabled
                  aria-disabled="true"
                  className="appearance-none bg-slate-50 pr-12">
                  <option value={documento.unidadeId}>
                    {unidadeNome} (ID {documento.unidadeId})
                  </option>
                </Select>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                  🔒
                </span>
              </div>
            </>
          ) : (
            <>
              <input type="hidden" {...register("unidadeId")} />
              <div className="relative">
                <Input
                  id="documento-unidade"
                  value={`${unidadeNome} (ID ${documento.unidadeId})`}
                  readOnly
                  aria-readonly="true"
                  className="bg-slate-50 pr-12 text-slate-500"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  🔒
                </span>
              </div>
            </>
          )}
        </FormField>
        <FormField
          id="documento-categoria"
          label="Categoria"
          required
          error={error("categoria")}>
          <Select
            id="documento-categoria"
            aria-required="true"
            aria-invalid={Boolean(errors.categoria)}
            {...register("categoria")}>
            <option value="">Selecione a categoria</option>
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField
          id="documento-descricao"
          label="Descrição"
          error={error("descricao")}>
          <Textarea
            id="documento-descricao"
            aria-invalid={Boolean(errors.descricao)}
            placeholder="Descreva o documento..."
            maxLength={500}
            {...register("descricao")}
          />
          <div className="mt-1 text-right text-xs text-slate-400">
            {descricao.length}/500
          </div>
        </FormField>
      </div>

      <div className="space-y-5">
        <FormField
          id="data-emissao"
          label="Data de emissão"
          error={error("dataEmissao")}>
          <Input
            id="data-emissao"
            type="date"
            aria-invalid={Boolean(errors.dataEmissao)}
            {...register("dataEmissao")}
          />
        </FormField>
        <FormField
          id="data-validade"
          label="Data de vencimento"
          required
          error={error("dataValidade")}
          action={
            statusPreview ? <StatusBadge status={statusPreview} /> : null
          }>
          <Input
            id="data-validade"
            type="date"
            aria-required="true"
            aria-invalid={Boolean(errors.dataValidade)}
            {...register("dataValidade")}
          />
        </FormField>
        <FormField
          id="documento-anexo"
          label="Anexo"
          required={mode === "criar"}
          error={error("anexo")}>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {selectedFile?.name ??
                    documento.anexo?.nome ??
                    "Nenhum arquivo anexado"}
                </p>
                {anexoSize !== undefined ? (
                  <p className="mt-1 text-xs text-slate-500">
                    {formatFileSize(anexoSize)}
                  </p>
                ) : null}
              </div>
              <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                {documento.anexo ? "Substituir arquivo" : "Anexar arquivo"}
                <input
                  id="documento-anexo"
                  type="file"
                  className="sr-only"
                  accept="application/pdf,image/jpeg,image/png"
                  aria-required={mode === "criar"}
                  aria-invalid={Boolean(errors.anexo)}
                  aria-describedby={
                    errors.anexo ? "documento-anexo-error" : undefined
                  }
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    setSelectedFile(file);
                    setValue("anexo", file, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                />
              </label>
            </div>
          </div>
        </FormField>
      </div>

      <div className="flex flex-col gap-3 lg:col-start-1 lg:row-start-2 lg:flex-row">
        <Button
          type="button"
          variant="danger"
          disabled={busy}
          onClick={onCancel}
          leadingIcon={
            <span aria-hidden="true" className="text-base leading-none">
              −
            </span>
          }
          className="w-full rounded-xl lg:w-auto">
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="success"
          disabled={busy}
          isLoading={busy}
          leadingIcon={
            <span aria-hidden="true" className="text-base leading-none">
              ✓
            </span>
          }
          className="w-full rounded-xl lg:w-auto">
          {mode === "criar" ? "Cadastrar documento" : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}

