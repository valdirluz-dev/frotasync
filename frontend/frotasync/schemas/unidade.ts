import { z } from "zod";

import { normalizarCep } from "../lib/cep";
import { UF_SIGLAS } from "../types/dashboard";

export const unidadeSchema = z
  .object({
    nome: z
      .string()
      .trim()
      .min(2, "Informe o nome da unidade (mínimo de 2 caracteres).")
      .max(100, "O nome da unidade deve ter até 100 caracteres."),
    identificador: z
      .string()
      .trim()
      .min(1, "Informe o identificador da unidade.")
      .max(10, "O identificador deve ter até 10 caracteres.")
      .regex(
        /^[\p{L}0-9-]+$/u,
        "Use somente letras, números e hífen no identificador.",
      ),
    cep: z
      .string()
      .trim()
      .min(1, "Informe o CEP.")
      .regex(/^(?:\d{8}|\d{5}-\d{3})$/, "Informe um CEP válido com 8 dígitos.")
      .transform(normalizarCep),
    logradouro: z
      .string()
      .trim()
      .min(1, "Informe o logradouro.")
      .max(150, "O logradouro deve ter até 150 caracteres."),
    numero: z
      .string()
      .trim()
      .min(1, "Informe o número ou S/N.")
      .max(10, "O número deve ter até 10 caracteres."),
    complemento: z
      .string()
      .trim()
      .max(100, "O complemento deve ter até 100 caracteres.")
      .optional(),
    cidade: z
      .string()
      .trim()
      .min(1, "Informe a cidade.")
      .max(100, "A cidade deve ter até 100 caracteres."),
    bairro: z
      .string()
      .trim()
      .min(1, "Informe o bairro.")
      .max(100, "O bairro deve ter até 100 caracteres."),
    uf: z.enum(UF_SIGLAS, { error: "Selecione uma UF válida." }),
    descricao: z
      .string()
      .trim()
      .max(500, "A descrição deve ter até 500 caracteres.")
      .optional(),
  })
  .strict();

export type UnidadeFormValues = z.infer<typeof unidadeSchema>;
export type UnidadeFormInput = z.input<typeof unidadeSchema>;
