import { CriarUnidadeSchema } from './criar-unidade.schema';

export const AtualizarUnidadeSchema = CriarUnidadeSchema;
export type AtualizarUnidadeDto = import('zod').z.infer<
  typeof AtualizarUnidadeSchema
>;
