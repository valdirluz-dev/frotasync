import { describe, expect, it } from '@jest/globals';
import { ListarDocumentosSchema } from './listar-documentos.schema';

const unidadeIdValido = 'd9428888-122b-4b42-9acc-2a83c47b3f6e';

describe('ListarDocumentosSchema', () => {
  it('deve aceitar todos os parâmetros válidos', () => {
    const resultado = ListarDocumentosSchema.safeParse({
      q: 'Alvará',
      categoria: 'Legal',
      unidadeId: unidadeIdValido,
      statusValidade: 'valido',
      page: '2',
      pageSize: '12',
    });

    expect(resultado.success).toBe(true);

    if (resultado.success) {
      expect(resultado.data).toEqual({
        q: 'Alvará',
        categoria: 'Legal',
        unidadeId: unidadeIdValido,
        statusValidade: 'valido',
        page: 2,
        pageSize: 12,
      });
    }
  });

  it('deve aplicar valores padrão de paginação', () => {
    const resultado = ListarDocumentosSchema.safeParse({});

    expect(resultado.success).toBe(true);

    if (resultado.success) {
      expect(resultado.data.page).toBe(1);
      expect(resultado.data.pageSize).toBe(20);
    }
  });

  it('deve coagir page e pageSize de strings para números', () => {
    const resultado = ListarDocumentosSchema.safeParse({
      page: '3',
      pageSize: '25',
    });

    expect(resultado.success).toBe(true);

    if (resultado.success) {
      expect(resultado.data.page).toBe(3);
      expect(resultado.data.pageSize).toBe(25);
    }
  });

  it('deve rejeitar page menor que 1', () => {
    expect(ListarDocumentosSchema.safeParse({ page: '0' }).success).toBe(false);
  });

  it('deve rejeitar pageSize menor que 1', () => {
    expect(ListarDocumentosSchema.safeParse({ pageSize: '0' }).success).toBe(
      false,
    );
  });

  it('deve rejeitar pageSize maior que 100', () => {
    expect(ListarDocumentosSchema.safeParse({ pageSize: '101' }).success).toBe(
      false,
    );
  });

  it.each([
    ['page', { page: '1.5' }],
    ['pageSize', { pageSize: '2.5' }],
  ])('deve rejeitar valor não inteiro em %s', (_campo, parametros) => {
    expect(ListarDocumentosSchema.safeParse(parametros).success).toBe(false);
  });

  it('deve rejeitar UUID inválido para unidadeId', () => {
    expect(
      ListarDocumentosSchema.safeParse({ unidadeId: 'unidade-1' }).success,
    ).toBe(false);
  });

  it('deve aceitar UUID válido para unidadeId', () => {
    expect(
      ListarDocumentosSchema.safeParse({
        unidadeId: unidadeIdValido,
      }).success,
    ).toBe(true);
  });

  it('deve rejeitar statusValidade inválido', () => {
    expect(
      ListarDocumentosSchema.safeParse({ statusValidade: 'vencido' }).success,
    ).toBe(false);
  });

  it.each(['valido', 'proximo_vencimento', 'expirado'])(
    'deve aceitar statusValidade %s',
    (statusValidade) => {
      expect(ListarDocumentosSchema.safeParse({ statusValidade }).success).toBe(
        true,
      );
    },
  );

  it.each(['empresaId', 'status', 'validade'])(
    'deve rejeitar o parâmetro desconhecido %s',
    (parametro) => {
      expect(
        ListarDocumentosSchema.safeParse({ [parametro]: 'valor' }).success,
      ).toBe(false);
    },
  );

  it('deve rejeitar o nome antigo validade', () => {
    expect(
      ListarDocumentosSchema.safeParse({ validade: 'valido' }).success,
    ).toBe(false);
  });

  it('deve aplicar trim em q e categoria', () => {
    const resultado = ListarDocumentosSchema.safeParse({
      q: '  Alvará  ',
      categoria: '  Legal  ',
    });

    expect(resultado.success).toBe(true);

    if (resultado.success) {
      expect(resultado.data.q).toBe('Alvará');
      expect(resultado.data.categoria).toBe('Legal');
    }
  });

  it('deve transformar busca vazia em ausência de filtro', () => {
    const resultado = ListarDocumentosSchema.safeParse({ q: '   ' });

    expect(resultado.success).toBe(true);

    if (resultado.success) {
      expect(resultado.data.q).toBeUndefined();
    }
  });

  it('deve rejeitar q acima de 150 caracteres', () => {
    expect(
      ListarDocumentosSchema.safeParse({ q: 'a'.repeat(151) }).success,
    ).toBe(false);
  });

  it('deve rejeitar categoria acima de 40 caracteres', () => {
    expect(
      ListarDocumentosSchema.safeParse({
        categoria: 'a'.repeat(41),
      }).success,
    ).toBe(false);
  });
});
