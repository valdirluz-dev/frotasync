import { describe, expect, it } from '@jest/globals';
import { AtualizarDocumentoSchema } from './atualizar-documento.schema';
import { CriarDocumentoSchema } from './criar-documento.schema';
import { DocumentoBaseSchema } from './documento.schema';

const documentoValido = {
  nome: 'Alvará',
  categoria: 'Legal',
  dataValidade: '2027-01-31',
};

describe('Schemas de documentos', () => {
  it('aceita um cadastro válido', () => {
    expect(
      CriarDocumentoSchema.safeParse({
        ...documentoValido,
        tipo: 'Licença',
        dataEmissao: '2026-01-31',
        descricao: 'Documento anual',
      }).success,
    ).toBe(true);
  });

  it('rejeita campos obrigatórios ausentes na criação', () => {
    expect(CriarDocumentoSchema.safeParse({}).success).toBe(false);
    expect(
      CriarDocumentoSchema.safeParse({
        nome: 'Alvará',
        dataValidade: '2027-01-31',
      }).success,
    ).toBe(false);
  });

  it('aceita os limites mínimo e máximo dos campos com restrição de tamanho', () => {
    expect(
      DocumentoBaseSchema.safeParse({
        nome: 'aa',
        categoria: 'a',
        tipo: '',
        dataValidade: '2027-01-31',
      }).success,
    ).toBe(true);
    expect(
      DocumentoBaseSchema.safeParse({
        nome: 'n'.repeat(150),
        categoria: 'c'.repeat(40),
        tipo: 't'.repeat(60),
        dataValidade: '2027-01-31',
      }).success,
    ).toBe(true);
  });

  it.each([
    ['nome', { nome: '' }],
    ['nome abaixo do mínimo', { nome: 'a' }],
    ['nome acima do máximo', { nome: 'n'.repeat(151) }],
    ['categoria', { categoria: '' }],
    ['categoria acima do máximo', { categoria: 'c'.repeat(41) }],
    ['tipo acima do máximo', { tipo: 't'.repeat(61) }],
  ])('rejeita %s', (_description, fields) => {
    expect(
      CriarDocumentoSchema.safeParse({
        ...documentoValido,
        ...fields,
      }).success,
    ).toBe(false);
  });

  it.each([
    ['dataEmissao', { dataEmissao: '31-01-2026' }],
    ['dataEmissao com data inexistente', { dataEmissao: '2026-02-30' }],
    ['dataValidade', { dataValidade: '2027/01/31' }],
    ['dataValidade com data inexistente', { dataValidade: '2027-02-30' }],
  ])('rejeita formato inválido em %s', (_description, fields) => {
    expect(
      CriarDocumentoSchema.safeParse({
        ...documentoValido,
        ...fields,
      }).success,
    ).toBe(false);
  });

  it('rejeita data de emissão posterior à data de validade', () => {
    const campos = {
      dataEmissao: '2027-02-01',
      dataValidade: '2027-01-31',
    };

    expect(
      CriarDocumentoSchema.safeParse({
        ...documentoValido,
        ...campos,
      }).success,
    ).toBe(false);
    expect(AtualizarDocumentoSchema.safeParse(campos).success).toBe(false);
  });

  it('rejeita statusValidade e outras propriedades não previstas', () => {
    expect(
      CriarDocumentoSchema.safeParse({
        ...documentoValido,
        statusValidade: 'valido',
      }).success,
    ).toBe(false);
    expect(
      AtualizarDocumentoSchema.safeParse({
        statusValidade: 'valido',
      }).success,
    ).toBe(false);
    expect(
      CriarDocumentoSchema.safeParse({
        ...documentoValido,
        campoExtra: true,
      }).success,
    ).toBe(false);
    expect(
      AtualizarDocumentoSchema.safeParse({
        campoExtra: true,
      }).success,
    ).toBe(false);
  });

  it('aceita atualização parcial válida', () => {
    expect(
      AtualizarDocumentoSchema.safeParse({ nome: 'Novo nome' }).success,
    ).toBe(true);
  });

  it('aceita payload vazio para permitir atualização somente do anexo', () => {
    expect(AtualizarDocumentoSchema.safeParse({}).success).toBe(true);
  });
});
