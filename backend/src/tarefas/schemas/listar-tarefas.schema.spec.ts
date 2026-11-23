import { describe, expect, it } from '@jest/globals';
import {
  ListarTarefasPorUnidadeSchema,
  ListarTarefasSchema,
} from './listar-tarefas.schema';

const unidadeIdValido = 'd9428888-122b-4b42-9acc-2a83c47b3f6e';

describe('Schemas de listagem de tarefas', () => {
  it('aceita filtros válidos na listagem global', () => {
    const resultado = ListarTarefasSchema.safeParse({
      q: '  Revisar documentos  ',
      unidadeId: unidadeIdValido,
      status: 'em_andamento',
      page: '2',
      pageSize: '12',
    });

    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toEqual({
        q: 'Revisar documentos',
        unidadeId: unidadeIdValido,
        status: 'em_andamento',
        page: 2,
        pageSize: 12,
      });
    }
  });

  it('aceita filtros válidos na listagem por unidade', () => {
    const resultado = ListarTarefasPorUnidadeSchema.safeParse({
      q: '  Inspeção  ',
      status: 'pendente',
    });

    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.q).toBe('Inspeção');
      expect(resultado.data.status).toBe('pendente');
    }
  });

  it('aplica valores padrão de paginação', () => {
    const resultado = ListarTarefasSchema.safeParse({});

    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.page).toBe(1);
      expect(resultado.data.pageSize).toBe(20);
    }
  });

  it('coage page e pageSize de strings para números', () => {
    const resultado = ListarTarefasSchema.safeParse({
      page: '3',
      pageSize: '25',
    });

    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.page).toBe(3);
      expect(resultado.data.pageSize).toBe(25);
    }
  });

  it.each([
    ['page menor que 1', { page: '0' }],
    ['page decimal', { page: '1.5' }],
    ['pageSize menor que 1', { pageSize: '0' }],
    ['pageSize decimal', { pageSize: '2.5' }],
    ['pageSize acima de 100', { pageSize: '101' }],
  ])('rejeita %s', (_descricao, parametros) => {
    expect(ListarTarefasSchema.safeParse(parametros).success).toBe(false);
  });

  it('rejeita UUID inválido para unidadeId', () => {
    expect(
      ListarTarefasSchema.safeParse({ unidadeId: 'unidade-1' }).success,
    ).toBe(false);
  });

  it.each(['pendente', 'em_andamento', 'concluida'])(
    'aceita o status %s',
    (status) => {
      expect(ListarTarefasSchema.safeParse({ status }).success).toBe(true);
      expect(ListarTarefasPorUnidadeSchema.safeParse({ status }).success).toBe(
        true,
      );
    },
  );

  it('rejeita status inválido', () => {
    expect(ListarTarefasSchema.safeParse({ status: 'cancelada' }).success).toBe(
      false,
    );
    expect(
      ListarTarefasPorUnidadeSchema.safeParse({ status: 'cancelada' }).success,
    ).toBe(false);
  });

  it('transforma busca vazia em ausência de filtro', () => {
    const resultado = ListarTarefasSchema.safeParse({ q: '   ' });

    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.q).toBeUndefined();
    }
  });

  it('rejeita busca acima de 150 caracteres', () => {
    expect(ListarTarefasSchema.safeParse({ q: 'a'.repeat(151) }).success).toBe(
      false,
    );
  });

  it('rejeita parâmetros desconhecidos', () => {
    expect(
      ListarTarefasSchema.safeParse({ empresaId: 'empresa-1' }).success,
    ).toBe(false);
    expect(
      ListarTarefasPorUnidadeSchema.safeParse({ unidadeId: unidadeIdValido })
        .success,
    ).toBe(false);
  });
});
