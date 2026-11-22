import { describe, expect, it } from '@jest/globals';
import { CriarUnidadeSchema } from './criar-unidade.schema';

describe('CriarUnidadeSchema', () => {
  const unidadeValida = {
    nome: 'Filial Recife',
    codigo: 'REC-001',
    cep: '50000000',
    logradouro: 'Rua Exemplo',
    numero: '123',
    complemento: 'Sala 2',
    bairro: 'Centro',
    cidade: 'Recife',
    uf: 'PE',
    descricao: 'Unidade de Recife',
  };

  it('should accept valid unit data', () => {
    expect(CriarUnidadeSchema.safeParse(unidadeValida).success).toBe(true);
  });

  it('should reject invalid CEP', () => {
    const resultado = CriarUnidadeSchema.safeParse({
      ...unidadeValida,
      cep: '1234567',
    });

    expect(resultado.success).toBe(false);
  });

  it('should reject invalid UF', () => {
    const resultado = CriarUnidadeSchema.safeParse({
      ...unidadeValida,
      uf: 'pe',
    });

    expect(resultado.success).toBe(false);
  });

  it('should reject extra fields', () => {
    const resultado = CriarUnidadeSchema.safeParse({
      ...unidadeValida,
      empresa_id: 'empresa-123',
    });

    expect(resultado.success).toBe(false);
  });

  it('should reject missing required fields', () => {
    const resultado = CriarUnidadeSchema.safeParse({
      nome: 'Filial Recife',
    });

    expect(resultado.success).toBe(false);
  });

  it('should accept optional fields omitted', () => {
    const { complemento, descricao, ...unidadeSemOpcionais } = unidadeValida;

    expect(
      CriarUnidadeSchema.safeParse(unidadeSemOpcionais).success,
    ).toBe(true);
  });

  it('should trim nome and codigo', () => {
    const resultado = CriarUnidadeSchema.safeParse({
      ...unidadeValida,
      nome: '  Filial Recife  ',
      codigo: '  REC-001  ',
    });

    expect(resultado.success).toBe(true);

    if (resultado.success) {
      expect(resultado.data.nome).toBe('Filial Recife');
      expect(resultado.data.codigo).toBe('REC-001');
    }
  });
});
