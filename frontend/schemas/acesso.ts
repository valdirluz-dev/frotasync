import { z } from "zod";

const emailObrigatorio = (mensagem: string) =>
  z.string().refine((value) => value.trim().length > 0, {
    message: mensagem,
  });

export const loginSchema = z.object({
  email: emailObrigatorio("Digite seu e-mail corporativo"),
  senha: z.string().refine((value) => value.trim().length > 0, {
    message: "Digite sua senha",
  }),
});

const senhaForte = z
  .string()
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

export type LoginValues = z.infer<typeof loginSchema>;
export type CadastroAcessoValues = z.infer<typeof cadastroAcessoSchema>;
