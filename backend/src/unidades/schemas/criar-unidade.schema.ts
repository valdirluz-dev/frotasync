import { z } from 'zod';

export const UF_SIGLAS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;

export const CriarUnidadeSchema = z.strictObject({
  nome: z.string().trim().min(2).max(100),
  codigo: z.string().trim().min(1).max(10).regex(
    /^[\p{L}0-9-]+$/u,
    'Use somente letras, números e hífen',
  ),
  cep: z.string().regex(/^\d{8}$/, 'CEP deve ter 8 dígitos'),
  logradouro: z.string().trim().min(1).max(150),
  numero: z.string().trim().min(1).max(10),
  complemento: z.string().trim().max(100).optional(),
  bairro: z.string().trim().min(1).max(100),
  cidade: z.string().trim().min(1).max(100),
  uf: z.enum(UF_SIGLAS),
  descricao: z.string().trim().max(500).optional(),
});

export type CriarUnidadeDto = z.infer<typeof CriarUnidadeSchema>;
