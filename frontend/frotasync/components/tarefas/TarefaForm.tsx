"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";

import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button, FormField, Input, Textarea } from "@/components/ui";
import { tarefaSchema, prazoAlteradoValido, type TarefaFormInput, type TarefaFormValues } from "@/schemas/tarefa";
import type { Tarefa } from "@/types/dashboard";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }).format(new Date(`${value.slice(0, 10)}T00:00:00.000Z`));
}

type TarefaFormProps = {
  tarefa: Tarefa;
  unidadeNome: string;
  mode?: "criar" | "editar";
  defaultValues?: Partial<TarefaFormInput>;
  isSaving?: boolean;
  onSubmit: SubmitHandler<TarefaFormValues>;
  onCancel: () => void;
  onNoChanges?: () => void;
};

export function TarefaForm({ tarefa, unidadeNome, mode = "editar", defaultValues, isSaving = false, onSubmit, onCancel, onNoChanges }: TarefaFormProps) {
  const initial: TarefaFormInput = {
    titulo: tarefa.titulo,
    prazoFinal: tarefa.prazoFinal,
    descricao: tarefa.descricao ?? "",
    ...defaultValues,
  };
  const { register, handleSubmit, watch, setError, formState: { errors, isDirty, isSubmitting } } = useForm<TarefaFormInput, unknown, TarefaFormValues>({
    resolver: zodResolver(tarefaSchema),
    defaultValues: initial,
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });
  const prazo = watch("prazoFinal");
  const descricao = watch("descricao") ?? "";
  const busy = isSaving || isSubmitting;

  function fieldError(field: keyof TarefaFormInput) {
    const message = errors[field]?.message;
    return typeof message === "string" ? message : undefined;
  }

  function submit(values: TarefaFormValues) {
    if (mode === "editar" && !isDirty) {
      onNoChanges?.();
      return;
    }
    if (!prazoAlteradoValido(values.prazoFinal, tarefa.prazoFinal)) {
      setError("prazoFinal", { type: "validate", message: "O prazo não pode ser anterior a hoje quando alterado." });
      return;
    }
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="grid grid-cols-1 gap-x-10 gap-y-7 lg:grid-cols-2">
      <div className="space-y-5">
        <FormField id="tarefa-titulo" label="Título" required error={fieldError("titulo")}>
          <Input id="tarefa-titulo" aria-required="true" aria-invalid={Boolean(errors.titulo)} placeholder="Digite o título da tarefa..." {...register("titulo")} />
        </FormField>
        <FormField id="tarefa-unidade" label="Unidade" required>
          <div className="relative">
            <Input id="tarefa-unidade" value={`${unidadeNome} (ID ${tarefa.unidadeId})`} readOnly aria-readonly="true" className="pr-12 bg-slate-50 text-slate-500" />
            <span aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">🔒</span>
          </div>
        </FormField>
        <FormField id="tarefa-descricao" label="Descrição" error={fieldError("descricao")}>
          <Textarea id="tarefa-descricao" aria-invalid={Boolean(errors.descricao)} placeholder="Descreva a tarefa..." maxLength={500} {...register("descricao")} />
          <div className="mt-1 text-right text-xs text-slate-400">{descricao.length}/500</div>
        </FormField>
      </div>

      <div className="space-y-5">
        <FormField id="tarefa-prazo" label="Prazo final" required error={fieldError("prazoFinal")}>
          <Input id="tarefa-prazo" type="date" aria-required="true" aria-invalid={Boolean(errors.prazoFinal)} {...register("prazoFinal")} />
        </FormField>
        <FormField id="tarefa-status" label="Status">
          <div className="flex h-12 items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4" aria-readonly="true">
            <StatusBadge status={tarefa.status} />
            <span className="text-xs text-slate-500">O status é alterado na lista de tarefas</span>
          </div>
        </FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="tarefa-inicio" label="Data de início">
            <Input id="tarefa-inicio" value={formatDate(tarefa.dataInicio)} readOnly aria-readonly="true" className="bg-slate-50 text-slate-500" />
          </FormField>
          <FormField id="tarefa-conclusao" label="Data de conclusão">
            <Input id="tarefa-conclusao" value={formatDate(tarefa.dataConclusao)} readOnly aria-readonly="true" className="bg-slate-50 text-slate-500" />
          </FormField>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:col-start-1 lg:row-start-2 lg:flex-row">
        <Button type="button" variant="danger" disabled={busy} onClick={onCancel} leadingIcon={<span aria-hidden="true" className="text-base leading-none">−</span>} className="w-full rounded-xl lg:w-auto">Cancelar</Button>
        <Button type="submit" variant="success" disabled={busy} isLoading={busy} leadingIcon={<span aria-hidden="true" className="text-base leading-none">✓</span>} className="w-full rounded-xl lg:w-auto">Salvar alterações</Button>
      </div>
    </form>
  );
}
