import { CadastroSchema } from './cadastro.schema';

const cadastroValido = {
  pessoais: {
    nome: 'João da Silva',
    cpf: '52998224725',
    telefone: '81999999999',
    cargo: 'Administrador',
  },
  empresa: {
    nomeEmpresa: 'Frotasync Transportes',
    razaoSocial: 'Frotasync Transportes Ltda',
    cnpj: '11222333000181',
    segmento: 'Transporte',
    tipoUnidade: 'matriz' as const,
    cep: '50000000',
    logradouro: 'Rua de Teste',
    numero: '100',
    complemento: 'Sala 1',
    bairro: 'Centro',
    cidade: 'Recife',
    uf: 'PE' as const,
  },
  login: {
    email: 'admin@frotasync.com',
    senha: 'SenhaTeste123!',
    confirmarSenha: 'SenhaTeste123!',
    aceiteTermos: true as const,
  },
};

describe('CadastroSchema', () => {
  it('deve aceitar um cadastro válido', () => {
    expect(CadastroSchema.safeParse(cadastroValido).success).toBe(true);
  });

  it('deve rejeitar CPF inválido', () => {
    const dados = structuredClone(cadastroValido);
    dados.pessoais.cpf = '52998224724';

    expect(CadastroSchema.safeParse(dados).success).toBe(false);
  });

  it('deve rejeitar CNPJ inválido', () => {
    const dados = structuredClone(cadastroValido);
    dados.empresa.cnpj = '11222333000182';

    expect(CadastroSchema.safeParse(dados).success).toBe(false);
  });

  it('deve rejeitar telefone fora do padrão', () => {
    const dados = structuredClone(cadastroValido);
    dados.pessoais.telefone = '123';

    expect(CadastroSchema.safeParse(dados).success).toBe(false);
  });

  it('deve rejeitar UF inválida', () => {
    const dados = structuredClone(cadastroValido);
    dados.empresa.uf = 'XX' as 'PE';

    expect(CadastroSchema.safeParse(dados).success).toBe(false);
  });

  it('deve rejeitar senha fraca', () => {
    const dados = structuredClone(cadastroValido);
    dados.login.senha = 'senhafraca';
    dados.login.confirmarSenha = 'senhafraca';

    expect(CadastroSchema.safeParse(dados).success).toBe(false);
  });

  it('deve rejeitar senhas diferentes', () => {
    const dados = structuredClone(cadastroValido);
    dados.login.confirmarSenha = 'OutraSenha123!';

    expect(CadastroSchema.safeParse(dados).success).toBe(false);
  });

  it('deve rejeitar cadastro sem aceite dos termos', () => {
    const dados = structuredClone(cadastroValido);
    dados.login.aceiteTermos = false as true;

    expect(CadastroSchema.safeParse(dados).success).toBe(false);
  });

  it('deve rejeitar campo extra na raiz', () => {
    const dados = {
      ...cadastroValido,
      campoExtra: 'não permitido',
    };

    expect(CadastroSchema.safeParse(dados).success).toBe(false);
  });

  it('deve rejeitar campo extra dentro dos dados pessoais', () => {
    const dados = structuredClone(cadastroValido);
    Object.assign(dados.pessoais, { idade: 30 });

    expect(CadastroSchema.safeParse(dados).success).toBe(false);
  });
});
