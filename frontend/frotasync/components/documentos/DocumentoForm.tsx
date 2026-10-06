"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button, FormField, Input, Select, Textarea } from "@/components/ui";
import { calcularStatusDocumento } from "@/lib/status";
import { documentoSchema, type DocumentoFormInput, type DocumentoFormValues } from "@/schemas/documento";
import type { Documento, DocumentoAnexo } from "@/types/dashboard";

const maxFileSize = 10 * 1024 * 1024;

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type DocumentoFormProps = {
  documento: Documento;
  unidadeNome: string;
  categorias: string[];
  mode?: "criar" | "editar";
  defaultValues?: Partial<DocumentoFormInput>;
  isSaving?: boolean;
  onSubmit: SubmitHandler<DocumentoFormValues>;
  onCancel: () => void;
  onNoChanges?: () => void;
};

export function DocumentoForm({ documento, unidadeNome, categorias, mode = "editar", defaultValues, isSaving = false, onSubmit, onCancel, onNoChanges }: DocumentoFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | undefined>();
  const initial = useMemo<DocumentoFormInput>(() => ({
    nome: documento.nome,
    categoria: documento.categoria,
    dataEmissao: documento.dataEmissao ?? "",
    dataValidade: documento.dataValidade,
    descricao: documento.descricao ?? "",
    ...defaultValues,
  }), [defaultValues, documento]);

  const { register, handleSubmit, watch, setError, formState: { errors, isDirty, isSubmitting } } = useForm<DocumentoFormInput, unknown, DocumentoFormValues>({
    resolver: zodResolver(documentoSchema),
    defaultValues: initial,
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  useEffect(() => {
    if (!selectedFile) return;
    if (selectedFile.size > maxFileSize) setError("anexo", { type: "validate", message: "O arquivo deve ter no máximo 10 MB." });
  }, [selectedFile, setError]);

  const validade = watch("dataValidade");
  const descricao = watch("descricao") ?? "";
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
    if (selectedFile) {
      if (selectedFile.size > maxFileSize) return;
      if (!["application/pdf", "image/jpeg", "image/png"].includes(selectedFile.type)) {
        setError("anexo", { type: "validate", message: "Envie um PDF, JPG ou PNG." });
        return;
      }
    }
    onSubmit({ ...values, anexo: selectedFile });
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="grid grid-cols-1 gap-x-10 gap-y-7 lg:grid-cols-2">
      <div className="space-y-5">
        <FormField id="documento-nome" label="Nome do documento" required error={error("nome")}>
          <Input id="documento-nome" aria-required="true" aria-invalid={Boolean(errors.nome)} placeholder="Digite o nome do documento..." {...register("nome")} />
        </FormField>
        <FormField id="documento-unidade" label="Unidade" required>
          <div className="relative">
            <Input id="documento-unidade" value={`${unidadeNome} (ID ${documento.unidadeId})`} readOnly aria-readonly="true" className="pr-12 bg-slate-50 text-slate-500" />
            <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">🔒</span>
          </div>
        </FormField>
        <FormField id="documento-categoria" label="Categoria" required error={error("categoria")}>
          <Select id="documento-categoria" aria-required="true" aria-invalid={Boolean(errors.categoria)} {...register("categoria")}>
            <option value="">Selecione a categoria</option>
            {categorias.map((categoria) => <option key={categoria} value={categoria}>{categoria}</option>)}
          </Select>
        </FormField>
        <FormField id="documento-descricao" label="Descrição" error={error("descricao")}>
          <Textarea id="documento-descricao" aria-invalid={Boolean(errors.descricao)} placeholder="Descreva o documento..." maxLength={500} {...register("descricao")} />
          <div className="mt-1 text-right text-xs text-slate-400">{descricao.length}/500</div>
        </FormField>
      </div>

      <div className="space-y-5">
        <FormField id="data-emissao" label="Data de emissão" required error={error("dataEmissao")}>
          <Input id="data-emissao" type="date" aria-required="true" aria-invalid={Boolean(errors.dataEmissao)} {...register("dataEmissao")} />
        </FormField>
        <FormField id="data-validade" label="Data de vencimento" required error={error("dataValidade")} action={statusPreview ? <StatusBadge status={statusPreview} /> : null}>
          <Input id="data-validade" type="date" aria-required="true" aria-invalid={Boolean(errors.dataValidade)} {...register("dataValidade")} />
        </FormField>
        <FormField id="documento-anexo" label="Anexo" error={error("anexo")}>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">{documento.anexo?.nome ?? "Nenhum arquivo anexado"}</p>
                {documento.anexo ? <p className="mt-1 text-xs text-slate-500">{formatFileSize(documento.anexo.tamanhoBytes)}</p> : null}
              </div>
              <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                Substituir arquivo
                <input
                  id="documento-anexo"
                  type="file"
                  className="sr-only"
                  accept="application/pdf,image/jpeg,image/png"
                  aria-describedby={errors.anexo ? "documento-anexo-error" : undefined}
                  onChange={(event) => setSelectedFile(event.target.files?.[0])}
                />
              </label>
            </div>
            {selectedFile ? <p className="mt-3 text-xs font-medium text-indigo-700">Novo arquivo: {selectedFile.name} ({formatFileSize(selectedFile.size)})</p> : null}
          </div>
        </FormField>
      </div>

      <div className="flex flex-col gap-3 lg:col-start-1 lg:row-start-2 lg:flex-row">
        <Button type="button" variant="danger" disabled={busy} onClick={onCancel} leadingIcon={<span aria-hidden="true" className="text-base leading-none">−</span>} className="w-full rounded-xl lg:w-auto">Cancelar</Button>
        <Button type="submit" variant="success" disabled={busy} isLoading={busy} leadingIcon={<span aria-hidden="true" className="text-base leading-none">✓</span>} className="w-full rounded-xl lg:w-auto">Salvar alterações</Button>
      </div>
    </form>
  );
}

export function toDocumentoAnexo(file?: File): DocumentoAnexo | undefined {
  return file ? { nome: file.name, tamanhoBytes: file.size, tipo: file.type } : undefined;
}
