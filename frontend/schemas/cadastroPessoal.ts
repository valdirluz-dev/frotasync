import { z } from "zod";

import { isValidCpf } from "@/utils/validators";

export const cadastroPessoalSchema = z.object({
  nome: z.string().trim().min(3, "Informe seu nome completo (mínimo 3 caracteres).").max(150, "Nome deve ter no máximo 150 caracteres."),
  cpf: z
    .string()
    .refine((value) => value.trim().length > 0, {
      message: "Digite seu CPF",
    })
    .refine((value) => value.replace(/\D/g, "").length === 11, {
      message: "CPF deve conter 11 dígitos.",
    })
    .refine(isValidCpf, {
      message: "CPF inválido. Verifique os números novamente.",
    }),
  telefone: z
    .string()
    .refine((value) => value.trim().length > 0, {
      message: "Digite seu número de telefone",
    })
    .refine((value) => {
      const digits = value.replace(/\D/g, "");
      const national = digits.startsWith("55") && [12, 13].includes(digits.length)
        ? digits.slice(2)
        : digits;
      return /^\d{10,11}$/.test(national);
    }, {
      message: "Telefone deve conter DDD e número válido.",
    }),
  cargo: z.string().trim().min(2, "Cargo deve ter no mínimo 2 caracteres.").max(100, "Cargo deve ter no máximo 100 caracteres."),
});

export type CadastroPessoalValues = z.infer<typeof cadastroPessoalSchema>;
