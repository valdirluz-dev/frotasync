import { describe, expect, it } from '@jest/globals';
import { AtualizarDocumentoSchema } from './atualizar-documento.schema';
import { CriarDocumentoSchema } from './criar-documento.schema';

describe('AtualizarDocumentoSchema', () => {
  it.each([
    ['nome', { nome: 'Novo nome' }],
    ['categoria', { categoria: 'Operacional' }],
    ['tipo', { tipo: 'Licença' }],
    ['dataEmissao', { dataEmissao: '2026-01-15' }],
    ['dataValidade', { dataValidade: '2027-01-15' }],
    ['descricao', { descricao: 'Descrição atualizada' }],
  ])('aceita atualização parcial de %s', (_campo, payload) => {
    expect(AtualizarDocumentoSchema.safeParse(payload).success).toBe(true);
  });

  it('aplica trim e aceita os limites de tamanho definidos pelo contrato', () => {
    const resultado = AtualizarDocumentoSchema.safeParse({
      nome: `  ${'n'.repeat(150)}  `,
      categoria: `  ${'c'.repeat(40)}  `,
      tipo: `  ${'t'.repeat(60)}  `,
      descricao: `  ${'d'.repeat(500)}  `,
    });

    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.nome).toBe('n'.repeat(150));
      expect(resultado.data.categoria).toBe('c'.repeat(40));
      expect(resultado.data.tipo).toBe('t'.repeat(60));
      expect(resultado.data.descricao).toBe('d'.repeat(500));
    }
  });

  it('rejeita nome com menos de 2 ou mais de 150 caracteres', () => {
    expect(AtualizarDocumentoSchema.safeParse({ nome: 'a' }).success).toBe(
      false,
    );
    expect(
      AtualizarDocumentoSchema.safeParse({ nome: 'n'.repeat(151) }).success,
    ).toBe(false);
  });

  it('rejeita categoria vazia ou acima de 40 caracteres', () => {
    expect(AtualizarDocumentoSchema.safeParse({ categoria: ' ' }).success).toBe(
      false,
    );
    expect(
      AtualizarDocumentoSchema.safeParse({
        categoria: 'c'.repeat(41),
      }).success,
    ).toBe(false);
  });

  it('rejeita tipo acima de 60 e descrição acima de 500 caracteres', () => {
    expect(
      AtualizarDocumentoSchema.safeParse({ tipo: 't'.repeat(61) }).success,
    ).toBe(false);
    expect(
      AtualizarDocumentoSchema.safeParse({
        descricao: 'd'.repeat(501),
      }).success,
    ).toBe(false);
  });

  it('rejeita datas fora do formato ISO ou inexistentes', () => {
    for (const payload of [
      { dataEmissao: '15-01-2026' },
      { dataEmissao: '2026-02-30' },
      { dataValidade: '2027/01/15' },
      { dataValidade: '2027-02-30' },
    ]) {
      expect(AtualizarDocumentoSchema.safeParse(payload).success).toBe(false);
    }
  });

  it('rejeita emissão posterior à validade quando ambas são informadas', () => {
    expect(
      AtualizarDocumentoSchema.safeParse({
        dataEmissao: '2027-02-01',
        dataValidade: '2027-01-31',
      }).success,
    ).toBe(false);
  });

  it('rejeita propriedades desconhecidas, statusValidade e unidadeId', () => {
    for (const payload of [
      { campoExtra: true },
      { statusValidade: 'valido' },
      { unidadeId: 'd9428888-122b-4b42-9acc-2a83c47b3f6e' },
    ]) {
      expect(AtualizarDocumentoSchema.safeParse(payload).success).toBe(false);
    }
  });

  it('aceita corpo vazio para permitir atualização somente do anexo', () => {
    expect(AtualizarDocumentoSchema.safeParse({}).success).toBe(true);
  });

  it('mantém ausentes os campos não enviados', () => {
    expect(AtualizarDocumentoSchema.parse({ nome: 'Novo nome' })).toEqual({
      nome: 'Novo nome',
    });
  });

  it('normaliza dataEmissao vazia como ausente', () => {
    const resultado = AtualizarDocumentoSchema.safeParse({
      dataEmissao: '',
    });

    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.dataEmissao).toBeUndefined();
    }
  });

  it('mantém as validações obrigatórias do schema de criação', () => {
    expect(
      CriarDocumentoSchema.safeParse({
        nome: 'Documento',
        categoria: 'Legal',
        dataValidade: '2027-01-15',
      }).success,
    ).toBe(true);
    expect(
      CriarDocumentoSchema.safeParse({
        nome: 'Documento',
        categoria: 'Legal',
      }).success,
    ).toBe(false);
    expect(
      CriarDocumentoSchema.safeParse({
        nome: 'D',
        categoria: 'Legal',
        dataValidade: '2027-01-15',
      }).success,
    ).toBe(false);
  });
});
