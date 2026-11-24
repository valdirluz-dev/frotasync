import { z } from 'zod';
import { cpfValido, cnpjValido } from './validadores';
import { senhaForte } from './senha.schema';

const UFs = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const;

export const CadastroSchema = z.strictObject({
  pessoais: z.strictObject({
    nome: z.string().trim().min(3).max(150),
    cpf: z
      .string()
      .regex(/^\d{11}$/, 'CPF deve conter 11 dígitos')
      .refine(cpfValido, 'CPF inválido'),
    telefone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido'),
    cargo: z.string().trim().min(2).max(100),
  }),

  empresa: z.strictObject({
    nomeEmpresa: z.string().trim().min(1).max(150),
    razaoSocial: z.string().trim().min(1).max(200),
    cnpj: z
      .string()
      .regex(/^\d{14}$/, 'CNPJ deve conter 14 dígitos')
      .refine(cnpjValido, 'CNPJ inválido'),
    segmento: z.string().trim().min(1).max(100),
    tipoUnidade: z.enum(['matriz', 'filial']),
    cep: z.string().regex(/^\d{8}$/, 'CEP deve conter 8 dígitos'),
    logradouro: z.string().trim().min(1).max(150),
    numero: z.string().trim().min(1).max(10),
    complemento: z.string().trim().max(100).optional(),
    bairro: z.string().trim().min(1).max(100),
    cidade: z.string().trim().min(1).max(100),
    uf: z.enum(UFs),
  }),

  login: z
    .strictObject({
      email: z.email().max(180),
      senha: senhaForte,
      confirmarSenha: z.string(),
      aceiteTermos: z.literal(true),
    })
    .refine((dados) => dados.senha === dados.confirmarSenha, {
      error: 'As senhas não coincidem',
      path: ['confirmarSenha'],
    }),
});

export type CadastroDto = z.infer<typeof CadastroSchema>;
