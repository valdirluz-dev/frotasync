import { describe, expect, it } from '@jest/globals';
import { CriarTarefaSchema } from './criar-tarefa.schema';
import { AtualizarTarefaSchema } from './atualizar-tarefa.schema';
import { AtualizarStatusTarefaSchema } from './atualizar-status-tarefa.schema';
import { TarefaBaseSchema } from './tarefa.schema';

const tarefaValida = {
  titulo: 'Revisar documentação',
  prazoFinal: '2026-12-15',
};

describe('Schemas de tarefas', () => {
  describe('TarefaBaseSchema e CriarTarefaSchema', () => {
    it('aceita cadastro válido com descrição', () => {
      expect(
        CriarTarefaSchema.safeParse({
          ...tarefaValida,
          descricao: 'Revisar os documentos da unidade',
        }).success,
      ).toBe(true);
    });

    it('rejeita título e prazo ausentes', () => {
      expect(CriarTarefaSchema.safeParse({}).success).toBe(false);
      expect(
        CriarTarefaSchema.safeParse({ titulo: tarefaValida.titulo }).success,
      ).toBe(false);
      expect(
        CriarTarefaSchema.safeParse({ prazoFinal: tarefaValida.prazoFinal })
          .success,
      ).toBe(false);
    });

    it('aplica trim e aceita os limites de tamanho', () => {
      const resultado = TarefaBaseSchema.safeParse({
        titulo: `  ${'t'.repeat(150)}  `,
        descricao: `  ${'d'.repeat(500)}  `,
        prazoFinal: '2026-12-15',
      });

      expect(resultado.success).toBe(true);
      if (resultado.success) {
        expect(resultado.data.titulo).toBe('t'.repeat(150));
        expect(resultado.data.descricao).toBe('d'.repeat(500));
      }
    });

    it.each([
      ['título vazio', { titulo: '   ' }],
      ['título abaixo do mínimo', { titulo: 'A' }],
      ['título acima do máximo', { titulo: 't'.repeat(151) }],
      ['descrição acima do máximo', { descricao: 'd'.repeat(501) }],
    ])('rejeita %s', (_descricao, campos) => {
      expect(
        CriarTarefaSchema.safeParse({
          ...tarefaValida,
          ...campos,
        }).success,
      ).toBe(false);
    });

    it.each(['15-12-2026', '2026/12/15', '2026-02-30'])(
      'rejeita prazoFinal inválido: %s',
      (prazoFinal) => {
        expect(
          CriarTarefaSchema.safeParse({
            ...tarefaValida,
            prazoFinal,
          }).success,
        ).toBe(false);
      },
    );

    it('rejeita campos que devem ser controlados pelo servidor', () => {
      for (const campo of [
        { status: 'concluida' },
        { dataInicio: '2026-11-23' },
        { dataConclusao: '2026-11-23T10:00:00.000Z' },
        { unidadeId: 'd9428888-122b-4b42-9acc-2a83c47b3f6e' },
        { campoExtra: true },
      ]) {
        expect(
          CriarTarefaSchema.safeParse({
            ...tarefaValida,
            ...campo,
          }).success,
        ).toBe(false);
      }
    });
  });

  describe('AtualizarTarefaSchema', () => {
    it.each([
      ['título', { titulo: 'Novo título' }],
      ['descrição', { descricao: 'Nova descrição' }],
      ['prazo', { prazoFinal: '2026-12-20' }],
    ])('aceita atualização parcial de %s', (_campo, payload) => {
      expect(AtualizarTarefaSchema.safeParse(payload).success).toBe(true);
    });

    it('rejeita payload vazio', () => {
      expect(AtualizarTarefaSchema.safeParse({}).success).toBe(false);
    });

    it('mantém ausentes os campos não enviados', () => {
      expect(AtualizarTarefaSchema.parse({ titulo: 'Novo título' })).toEqual({
        titulo: 'Novo título',
      });
    });

    it('rejeita campos controlados pelo servidor ou desconhecidos', () => {
      for (const campo of [
        { status: 'concluida' },
        { dataInicio: '2026-11-23' },
        { dataConclusao: '2026-11-23T10:00:00.000Z' },
        { unidadeId: 'd9428888-122b-4b42-9acc-2a83c47b3f6e' },
        { campoExtra: true },
      ]) {
        expect(AtualizarTarefaSchema.safeParse(campo).success).toBe(false);
      }
    });

    it('rejeita prazo com formato ou data inexistente', () => {
      expect(
        AtualizarTarefaSchema.safeParse({ prazoFinal: '20-12-2026' }).success,
      ).toBe(false);
      expect(
        AtualizarTarefaSchema.safeParse({ prazoFinal: '2026-02-30' }).success,
      ).toBe(false);
    });
  });

  describe('AtualizarStatusTarefaSchema', () => {
    it.each(['pendente', 'em_andamento', 'concluida'])(
      'aceita o status %s com confirmação quando necessária',
      (status) => {
        const payload =
          status === 'concluida' ? { status, confirmacao: true } : { status };

        expect(AtualizarStatusTarefaSchema.safeParse(payload).success).toBe(
          true,
        );
      },
    );

    it('exige confirmação explícita para concluir', () => {
      expect(
        AtualizarStatusTarefaSchema.safeParse({ status: 'concluida' }).success,
      ).toBe(false);
      expect(
        AtualizarStatusTarefaSchema.safeParse({
          status: 'concluida',
          confirmacao: false,
        }).success,
      ).toBe(false);
      expect(
        AtualizarStatusTarefaSchema.safeParse({
          status: 'concluida',
          confirmacao: true,
        }).success,
      ).toBe(true);
    });

    it('rejeita status inválido e propriedades extras', () => {
      expect(
        AtualizarStatusTarefaSchema.safeParse({ status: 'cancelada' }).success,
      ).toBe(false);
      expect(
        AtualizarStatusTarefaSchema.safeParse({
          status: 'pendente',
          campoExtra: true,
        }).success,
      ).toBe(false);
    });
  });
});
