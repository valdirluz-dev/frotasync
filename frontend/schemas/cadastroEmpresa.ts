import { z } from "zod";

import { isValidCnpj } from "@/utils/validators";

export const cadastroEmpresaSchema = z.object({
  nomeEmpresa: z.string().refine((value) => value.trim().length > 0, {
    message: "Digite o nome comercial ou marca",
  }),
  razaoSocial: z.string().refine((value) => value.trim().length > 0, {
    message: "Digite a razão social",
  }),
  cnpj: z
    .string()
    .refine((value) => value.trim().length > 0, {
      message: "Digite o CNPJ",
    })
    .refine(isValidCnpj, {
      message: "CNPJ inválido. Verifique os números novamente.",
    }),
  segmento: z.string().refine((value) => value.trim().length > 0, {
    message: "Digite o segmento da empresa",
  }),
  tipoUnidade: z.string().refine((value) => value.trim().length > 0, {
    message: "Digite se é Matriz ou Filial",
  }),
  cep: z.string().refine((value) => value.trim().length > 0, {
    message: "Digite o CEP",
  }),
  estado: z.string().refine((value) => value.trim().length > 0, {
    message: "Digite o estado",
  }),
  cidade: z.string().refine((value) => value.trim().length > 0, {
    message: "Digite a cidade",
  }),
  bairro: z.string().refine((value) => value.trim().length > 0, {
    message: "Digite o bairro",
  }),
  logradouro: z.string().refine((value) => value.trim().length > 0, {
    message: "Digite o endereço",
  }),
  numero: z.string().refine((value) => value.trim().length > 0, {
    message: "Digite o número",
  }),
});

export type CadastroEmpresaValues = z.infer<typeof cadastroEmpresaSchema>;
