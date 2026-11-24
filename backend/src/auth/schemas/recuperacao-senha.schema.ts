import { z } from 'zod';
import { senhaForte } from './senha.schema';

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('E-mail inválido')
  .max(180, 'O e-mail deve ter no máximo 180 caracteres');

export const SolicitarRecuperacaoSenhaSchema = z.strictObject({
  email: emailSchema,
});

export const VerificarCodigoRecuperacaoSchema = z.strictObject({
  email: emailSchema,
  codigo: z
    .string()
    .regex(/^\d{5}$/, 'O código deve conter exatamente 5 dígitos'),
});

export const RedefinirSenhaSchema = z
  .strictObject({
    token: z.string().min(1, 'Token obrigatório').max(256),
    senha: senhaForte,
    confirmarSenha: z.string(),
  })
  .refine((dados) => dados.senha === dados.confirmarSenha, {
    error: 'As senhas não coincidem',
    path: ['confirmarSenha'],
  });

export type SolicitarRecuperacaoSenhaDto = z.infer<
  typeof SolicitarRecuperacaoSenhaSchema
>;
export type VerificarCodigoRecuperacaoDto = z.infer<
  typeof VerificarCodigoRecuperacaoSchema
>;
export type RedefinirSenhaDto = z.infer<typeof RedefinirSenhaSchema>;
