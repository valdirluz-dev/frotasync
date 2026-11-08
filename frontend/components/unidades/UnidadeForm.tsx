"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef, useImperativeHandle, useState } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";

import { useBuscarCep } from "@/hooks/useBuscarCep";
import { formatarCep, normalizarCep } from "@/lib/cep";
import { unidadeSchema } from "@/schemas/unidade";
import type { UnidadeFormInput, UnidadeFormValues } from "@/schemas/unidade";
import { Button, FormField, Input, Textarea } from "@/components/ui";
import { UnidadeSelect } from "@/components/unidades/UnidadeSelect";

type UnidadeFormProps = {
  onSubmit: SubmitHandler<UnidadeFormValues>;
  onCancel: () => void;
  defaultValues?: Partial<UnidadeFormInput>;
  mode?: "criar" | "editar";
  isSaving?: boolean;
  onNoChanges?: () => void;
};

export type UnidadeFormHandle = {
  setIdentifierError: (message: string) => void;
  focusIdentifier: () => void;
};

const initialValues: UnidadeFormInput = {
  nome: "",
  identificador: "",
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  cidade: "",
  bairro: "",
  uf: "PE",
  descricao: "",
};

export const UnidadeForm = forwardRef<UnidadeFormHandle, UnidadeFormProps>(
  function UnidadeForm(
    { onSubmit, onCancel, defaultValues, mode = "criar", isSaving = false, onNoChanges },
    ref,
  ) {
    const {
      register,
      control,
      handleSubmit,
      setValue,
      setFocus,
      setError,
      watch,
      formState: { errors, isSubmitting, isDirty },
    } = useForm<UnidadeFormInput, unknown, UnidadeFormValues>({
      resolver: zodResolver(unidadeSchema),
      defaultValues: { ...initialValues, ...defaultValues },
      mode: "onSubmit",
      reValidateMode: "onChange",
      shouldFocusError: true,
    });
    useImperativeHandle(
      ref,
      () => ({
        setIdentifierError: (message) =>
          setError("identificador", { type: "server", message }),
        focusIdentifier: () => setFocus("identificador"),
      }),
      [setError, setFocus],
    );
    const cepMutation = useBuscarCep();
    const cep = watch("cep");
    const [cepMessage, setCepMessage] = useState<string | null>(null);
    const busy = isSaving || isSubmitting;

    function handleValidSubmit(values: UnidadeFormValues) {
      if (mode === "editar" && !isDirty) {
        onNoChanges?.();
        return;
      }
      onSubmit(values);
    }
    const cepReady = normalizarCep(cep ?? "").length === 8;

    function fieldError(field: keyof UnidadeFormInput): string | undefined {
      const message = errors[field]?.message;
      return typeof message === "string" ? message : undefined;
    }

    function describedBy(field: keyof UnidadeFormInput, extraId?: string) {
      const ids = [fieldError(field) ? `${field}-error` : null, extraId]
        .filter(Boolean)
        .join(" ");
      return ids || undefined;
    }

    async function handleCepLookup() {
      setCepMessage(null);
      try {
        const address = await cepMutation.mutateAsync(normalizarCep(cep ?? ""));
        if (!address) {
          setCepMessage("CEP não encontrado. Preencha o endereço manualmente.");
          return;
        }

        setValue("logradouro", address.logradouro, {
          shouldDirty: true,
          shouldValidate: true,
        });
        setValue("bairro", address.bairro, {
          shouldDirty: true,
          shouldValidate: true,
        });
        setValue("cidade", address.cidade, {
          shouldDirty: true,
          shouldValidate: true,
        });
        setValue("uf", address.uf, {
          shouldDirty: true,
          shouldValidate: true,
        });
        setFocus("numero");
      } catch {
        setCepMessage(
          "Não foi possível buscar o CEP. Preencha o endereço manualmente.",
        );
      }
    }

    return (
      <form
        onSubmit={handleSubmit(handleValidSubmit)}
        noValidate
        className="grid grid-cols-1 gap-x-10 gap-y-7 lg:grid-cols-2">
        <div className="space-y-5">
          <FormField
            id="nome"
            label="Nome da unidade"
            required
            error={fieldError("nome")}>
            <Input
              id="nome"
              autoComplete="organization"
              aria-required="true"
              aria-invalid={Boolean(errors.nome)}
              aria-describedby={describedBy("nome")}
              placeholder="Digite o nome da unidade..."
              {...register("nome")}
            />
          </FormField>

          <FormField
            id="identificador"
            label="Identificador da Unidade"
            required
            error={fieldError("identificador")}>
            <Input
              id="identificador"
              aria-required="true"
              aria-invalid={Boolean(errors.identificador)}
              aria-describedby={describedBy("identificador")}
              placeholder="Exemplo: 002"
              maxLength={10}
              {...register("identificador")}
            />
          </FormField>

          <FormField
            id="cep"
            label="CEP"
            required
            error={fieldError("cep")}
            action={
              <Button
                type="button"
                variant="outline"
                disabled={!cepReady || cepMutation.isPending || busy}
                isLoading={cepMutation.isPending}
                onClick={() => void handleCepLookup()}
                className="rounded-lg px-3 py-1.5 text-xs shadow-none">
                Buscar CEP
              </Button>
            }>
            <Controller
              control={control}
              name="cep"
              render={({ field }) => (
                <Input
                  {...field}
                  id="cep"
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  aria-required="true"
                  aria-invalid={Boolean(errors.cep)}
                  aria-describedby={describedBy("cep", "cep-lookup-message")}
                  placeholder="Exemplo: 50000-000"
                  maxLength={9}
                  value={field.value ?? ""}
                  onChange={(event) => {
                    setCepMessage(null);
                    field.onChange(formatarCep(event.target.value));
                  }}
                />
              )}
            />
            <p
              id="cep-lookup-message"
              aria-live="polite"
              className={`mt-1.5 text-xs ${cepMessage ? "font-medium text-amber-800" : "sr-only"}`}>
              {cepMessage ?? ""}
            </p>
          </FormField>
        </div>

        <div className="grid grid-cols-12 gap-x-4 gap-y-5">
          <div className="col-span-12 sm:col-span-8">
            <FormField
              id="logradouro"
              label="Logradouro"
              required
              error={fieldError("logradouro")}>
              <Input
                id="logradouro"
                autoComplete="address-line1"
                aria-required="true"
                aria-invalid={Boolean(errors.logradouro)}
                aria-describedby={describedBy("logradouro")}
                placeholder="Avenida Exemplo"
                {...register("logradouro")}
              />
            </FormField>
          </div>
          <div className="col-span-12 sm:col-span-4">
            <FormField
              id="numero"
              label="Número"
              required
              error={fieldError("numero")}>
              <Input
                id="numero"
                autoComplete="address-line2"
                aria-required="true"
                aria-invalid={Boolean(errors.numero)}
                aria-describedby={describedBy("numero")}
                placeholder="123"
                maxLength={10}
                {...register("numero")}
              />
            </FormField>
          </div>

          <div className="col-span-12 sm:col-span-4">
            <FormField
              id="complemento"
              label="Complemento"
              error={fieldError("complemento")}>
              <Input
                id="complemento"
                aria-required="false"
                aria-invalid={Boolean(errors.complemento)}
                aria-describedby={describedBy("complemento")}
                placeholder="Ex: Galpão 2"
                maxLength={100}
                {...register("complemento")}
              />
            </FormField>
          </div>
          <div className="col-span-12 sm:col-span-8">
            <FormField
              id="cidade"
              label="Cidade"
              required
              error={fieldError("cidade")}>
              <Input
                id="cidade"
                autoComplete="address-level2"
                aria-required="true"
                aria-invalid={Boolean(errors.cidade)}
                aria-describedby={describedBy("cidade")}
                placeholder="Ex: Recife"
                {...register("cidade")}
              />
            </FormField>
          </div>

          <div className="col-span-12 sm:col-span-8">
            <FormField
              id="bairro"
              label="Bairro"
              required
              error={fieldError("bairro")}>
              <Input
                id="bairro"
                autoComplete="address-level3"
                aria-required="true"
                aria-invalid={Boolean(errors.bairro)}
                aria-describedby={describedBy("bairro")}
                placeholder="Ex: Centro"
                {...register("bairro")}
              />
            </FormField>
          </div>
          <div className="col-span-12 sm:col-span-4">
            <FormField id="uf" label="UF" required error={fieldError("uf")}>
              <UnidadeSelect
                id="uf"
                aria-required="true"
                aria-invalid={Boolean(errors.uf)}
                aria-describedby={describedBy("uf")}
                {...register("uf")}
              />
            </FormField>
          </div>

          <div className="col-span-12">
            <FormField
              id="descricao"
              label="Descrição"
              error={fieldError("descricao")}>
              <Textarea
                id="descricao"
                aria-required="false"
                aria-invalid={Boolean(errors.descricao)}
                aria-describedby={describedBy("descricao")}
                placeholder="Descreva sobre a unidade"
                maxLength={500}
                {...register("descricao")}
              />
              <div className="mt-1 text-right text-xs text-slate-400">
                {(watch("descricao") ?? "").length}/500
              </div>
            </FormField>
          </div>
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
                +
              </span>
            }
            className="w-full rounded-xl lg:w-auto">
            {mode === "criar" ? "Cadastrar unidade" : "Salvar alterações"}
          </Button>
        </div>
      </form>
    );
  },
);
