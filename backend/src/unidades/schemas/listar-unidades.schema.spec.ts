import { describe, expect, it } from '@jest/globals';
import { ListarUnidadesSchema } from './listar-unidades.schema';

describe('ListarUnidadesSchema', () => {
  it('deve aceitar parâmetros válidos', () => {
    const resultado = ListarUnidadesSchema.safeParse({
      q: 'Matriz',
      status: 'ativa',
      page: '2',
      pageSize: '12',
    });

    expect(resultado.success).toBe(true);

    if (resultado.success) {
      expect(resultado.data).toEqual({
        q: 'Matriz',
        status: 'ativa',
        page: 2,
        pageSize: 12,
      });
    }
  });

  it('deve aplicar valores padrão de paginação', () => {
    const resultado = ListarUnidadesSchema.safeParse({});

    expect(resultado.success).toBe(true);

    if (resultado.success) {
      expect(resultado.data.page).toBe(1);
      expect(resultado.data.pageSize).toBe(20);
    }
  });

  it('deve rejeitar status inválido', () => {
    expect(
      ListarUnidadesSchema.safeParse({ status: 'pendente' }).success,
    ).toBe(false);
  });

  it('deve rejeitar página menor que 1', () => {
    expect(
      ListarUnidadesSchema.safeParse({ page: '0' }).success,
    ).toBe(false);
  });

  it('deve rejeitar pageSize acima de 100', () => {
    expect(
      ListarUnidadesSchema.safeParse({ pageSize: '101' }).success,
    ).toBe(false);
  });

  it('deve rejeitar parâmetros desconhecidos', () => {
    expect(
      ListarUnidadesSchema.safeParse({ empresa_id: '123' }).success,
    ).toBe(false);
  });

  it('deve remover espaços extras da busca', () => {
    const resultado = ListarUnidadesSchema.safeParse({
      q: '  Matriz  ',
    });

    expect(resultado.success).toBe(true);

    if (resultado.success) {
      expect(resultado.data.q).toBe('Matriz');
    }
  });

  it('deve converter busca vazia em ausência de filtro', () => {
    const resultado = ListarUnidadesSchema.safeParse({ q: '   ' });

    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.q).toBeUndefined();
    }
  });

  it('deve rejeitar busca maior que 150 caracteres', () => {
    expect(
      ListarUnidadesSchema.safeParse({ q: 'a'.repeat(151) }).success,
    ).toBe(false);
  });
});
