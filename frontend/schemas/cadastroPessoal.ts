import { z } from "zod";

import { isValidCpf } from "@/utils/validators";

export const cadastroPessoalSchema = z.object({
  nome: z.string().refine((value) => value.trim().length > 0, {
    message: "Digite seu nome completo",
  }),
  cpf: z
    .string()
    .refine((value) => value.trim().length > 0, {
      message: "Digite seu CPF",
    })
    .refine(isValidCpf, {
      message: "CPF inválido. Verifique os números novamente.",
    }),
  telefone: z
    .string()
    .refine((value) => value.trim().length > 0, {
      message: "Digite seu número de telefone",
    })
    .refine((value) => value.replace(/\D/g, "").length >= 10, {
      message: "Telefone incompleto",
    }),
  cargo: z.string().refine((value) => value.trim().length > 0, {
    message: "Digite seu cargo ou papel na empresa",
  }),
});

export type CadastroPessoalValues = z.infer<typeof cadastroPessoalSchema>;
