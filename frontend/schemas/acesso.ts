import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Digite seu e-mail corporativo")
    .email("E-mail inválido")
    .max(180, "E-mail deve ter no máximo 180 caracteres"),
  senha: z.string().refine((value) => value.trim().length > 0, {
    message: "Digite sua senha",
  }),
});

export const senhaForte = z
  .string()
  .max(72, "A senha deve ter no máximo 72 caracteres")
  .refine((value) => value.trim().length > 0, {
    message: "Digite uma senha",
  })
  .refine(
    (value) =>
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_]).{8,}$/.test(
        value,
      ),
    {
      message:
        "A senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e símbolo.",
    },
  );

export const cadastroAcessoSchema = z
  .object({
    email: z
      .string()
      .refine((value) => value.trim().length > 0, {
        message: "Digite o e-mail corporativo",
      })
      .refine((value) => z.email().safeParse(value.trim()).success, {
        message: "E-mail inválido",
      }),
    senha: senhaForte,
    confirmarSenha: z.string().refine((value) => value.trim().length > 0, {
      message: "Confirme sua senha",
    }),
    aceiteTermos: z.boolean().refine((value) => value, {
      message:
        "É necessário aceitar os Termos de Uso e a Política de Privacidade.",
    }),
  })
  .superRefine((values, ctx) => {
    if (
      values.confirmarSenha.trim().length > 0 &&
      values.confirmarSenha !== values.senha
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmarSenha"],
        message: "As senhas não coincidem",
      });
    }
  });

export const redefinirSenhaSchema = z
  .object({
    token: z.string().min(1, "Solicite um novo código de recuperação."),
    senha: senhaForte,
    confirmarSenha: z.string().refine((value) => value.trim().length > 0, {
      message: "Confirme sua nova senha",
    }),
  })
  .superRefine((values, ctx) => {
    if (
      values.confirmarSenha.trim().length > 0 &&
      values.confirmarSenha !== values.senha
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmarSenha"],
        message: "As senhas não coincidem",
      });
    }
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type CadastroAcessoValues = z.infer<typeof cadastroAcessoSchema>;
