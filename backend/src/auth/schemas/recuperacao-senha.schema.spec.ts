import {
  SolicitarRecuperacaoSenhaSchema,
  VerificarCodigoRecuperacaoSchema,
  RedefinirSenhaSchema,
} from './recuperacao-senha.schema';

describe('Schemas de recuperação de senha', () => {
  describe('SolicitarRecuperacaoSenhaSchema', () => {
    it('normaliza o e-mail', () => {
      expect(
        SolicitarRecuperacaoSenhaSchema.parse({
          email: '  TESTE@EXEMPLO.COM ',
        }),
      ).toEqual({ email: 'teste@exemplo.com' });
    });

    it('rejeita e-mail inválido', () => {
      expect(
        SolicitarRecuperacaoSenhaSchema.safeParse({
          email: 'email-invalido',
        }).success,
      ).toBe(false);
    });

    it('rejeita propriedades extras', () => {
      expect(
        SolicitarRecuperacaoSenhaSchema.safeParse({
          email: 'teste@exemplo.com',
          codigo: '12345',
        }).success,
      ).toBe(false);
    });
  });

  describe('VerificarCodigoRecuperacaoSchema', () => {
    it('aceita código de cinco dígitos e normaliza e-mail', () => {
      expect(
        VerificarCodigoRecuperacaoSchema.parse({
          email: ' TESTE@EXEMPLO.COM ',
          codigo: '01234',
        }),
      ).toEqual({
        email: 'teste@exemplo.com',
        codigo: '01234',
      });
    });

    it.each(['1234', '123456', '12a45', ''])(
      'rejeita código inválido: %s',
      (codigo) => {
        expect(
          VerificarCodigoRecuperacaoSchema.safeParse({
            email: 'teste@exemplo.com',
            codigo,
          }).success,
        ).toBe(false);
      },
    );
  });

  describe('RedefinirSenhaSchema', () => {
    const dadosValidos = {
      token: 'token-de-recuperacao',
      senha: 'SenhaForte1!',
      confirmarSenha: 'SenhaForte1!',
    };

    it('aceita senha forte com confirmação correspondente', () => {
      expect(RedefinirSenhaSchema.safeParse(dadosValidos).success).toBe(true);
    });

    it('rejeita senhas diferentes', () => {
      expect(
        RedefinirSenhaSchema.safeParse({
          ...dadosValidos,
          confirmarSenha: 'OutraSenha1!',
        }).success,
      ).toBe(false);
    });

    it('rejeita senha fraca', () => {
      expect(
        RedefinirSenhaSchema.safeParse({
          ...dadosValidos,
          senha: 'senha123',
          confirmarSenha: 'senha123',
        }).success,
      ).toBe(false);
    });

    it('rejeita token vazio', () => {
      expect(
        RedefinirSenhaSchema.safeParse({
          ...dadosValidos,
          token: '',
        }).success,
      ).toBe(false);
    });
  });
});
