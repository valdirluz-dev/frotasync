import { z } from "zod";

import { isValidCnpj } from "@/utils/validators";

const ufs = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

export const cadastroEmpresaSchema = z.object({
  nomeEmpresa: z.string().trim().min(1, "Digite o nome comercial ou marca.").max(150, "Nome deve ter no máximo 150 caracteres."),
  razaoSocial: z.string().trim().min(1, "Digite a razão social.").max(200, "Razão social deve ter no máximo 200 caracteres."),
  cnpj: z
    .string()
    .refine((value) => value.trim().length > 0, {
      message: "Digite o CNPJ",
    })
    .refine((value) => value.replace(/\D/g, "").length === 14, {
      message: "CNPJ deve conter 14 dígitos.",
    })
    .refine(isValidCnpj, {
      message: "CNPJ inválido. Verifique os números novamente.",
    }),
  segmento: z.string().trim().min(1, "Digite o segmento da empresa.").max(100, "Segmento deve ter no máximo 100 caracteres."),
  tipoUnidade: z.string().trim().refine(
    (value) => ["matriz", "filial"].includes(value.toLowerCase()),
    { message: "Informe Matriz ou Filial." },
  ),
  cep: z
    .string()
    .refine((value) => value.trim().length > 0, {
      message: "Digite o CEP",
    })
    .refine((value) => /^\d{8}$/.test(value.replace(/\D/g, "")), {
      message: "CEP deve conter 8 dígitos.",
    }),
  estado: z.string().trim().toUpperCase().refine(
    (value) => ufs.includes(value),
    { message: "Informe a sigla válida do estado (UF), por exemplo PE." },
  ),
  cidade: z.string().trim().min(1, "Digite a cidade.").max(100, "Cidade deve ter no máximo 100 caracteres."),
  bairro: z.string().trim().min(1, "Digite o bairro.").max(100, "Bairro deve ter no máximo 100 caracteres."),
  logradouro: z.string().trim().min(1, "Digite o endereço.").max(150, "Endereço deve ter no máximo 150 caracteres."),
  numero: z.string().trim().min(1, "Digite o número.").max(10, "Número deve ter no máximo 10 caracteres."),
});

export type CadastroEmpresaValues = z.infer<typeof cadastroEmpresaSchema>;
