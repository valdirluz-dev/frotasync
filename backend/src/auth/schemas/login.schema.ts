import { z } from 'zod';

export const LoginSchema = z.strictObject({
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
  senha: z.string().min(1, 'A senha é obrigatória'),
  lembreMe: z.boolean().default(false),
});

export type LoginDto = z.infer<typeof LoginSchema>;
