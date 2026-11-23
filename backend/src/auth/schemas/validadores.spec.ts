import { cpfValido, cnpjValido } from './validadores';

describe('cpfValido', () => {
  it('deve aceitar um CPF válido', () => {
    expect(cpfValido('52998224725')).toBe(true);
  });

  it('deve rejeitar um CPF com dígitos verificadores incorretos', () => {
    expect(cpfValido('52998224724')).toBe(false);
  });

  it('deve rejeitar um CPF com todos os dígitos iguais', () => {
    expect(cpfValido('11111111111')).toBe(false);
  });

  it('deve rejeitar CPF com quantidade incorreta de dígitos', () => {
    expect(cpfValido('5299822472')).toBe(false);
  });

  it('deve rejeitar CPF com caracteres não numéricos', () => {
    expect(cpfValido('529.982.247-25')).toBe(false);
  });
});

describe('cnpjValido', () => {
  it('deve aceitar um CNPJ válido', () => {
    expect(cnpjValido('11222333000181')).toBe(true);
  });

  it('deve rejeitar um CNPJ com dígitos verificadores incorretos', () => {
    expect(cnpjValido('11222333000182')).toBe(false);
  });

  it('deve rejeitar um CNPJ com todos os dígitos iguais', () => {
    expect(cnpjValido('11111111111111')).toBe(false);
  });

  it('deve rejeitar CNPJ com quantidade incorreta de dígitos', () => {
    expect(cnpjValido('1122233300018')).toBe(false);
  });

  it('deve rejeitar CNPJ com caracteres não numéricos', () => {
    expect(cnpjValido('11.222.333/0001-81')).toBe(false);
  });
});
