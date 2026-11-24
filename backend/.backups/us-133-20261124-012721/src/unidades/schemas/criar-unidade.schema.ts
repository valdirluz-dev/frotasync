import { z } from 'zod';

export const CriarUnidadeSchema = z.strictObject({
  nome: z.string().trim().min(1, 'Nome é obrigatório').max(150),
  codigo: z.string().trim().min(1, 'Código é obrigatório').max(30),
  cep: z.string().regex(/^\d{8}$/, 'CEP deve conter 8 dígitos'),
  logradouro: z.string().trim().min(1).max(150),
  numero: z.string().trim().min(1).max(10),
  complemento: z.string().trim().max(100).optional(),
  bairro: z.string().trim().min(1).max(100),
  cidade: z.string().trim().min(1).max(100),
  uf: z.string().regex(/^[A-Z]{2}$/, 'UF deve conter 2 letras maiúsculas'),
  descricao: z.string().optional(),
});

export type CriarUnidadeDto = z.infer<typeof CriarUnidadeSchema>;
